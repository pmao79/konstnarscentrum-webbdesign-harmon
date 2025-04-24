
import { supabase } from "@/integrations/supabase/client";
import { batchCategorizeProducts } from "@/utils/productCategorization";

export const saveImportLog = async (params: {
  fileName: string,
  successCount: number,
  failedCount: number,
  supplier?: string
}) => {
  const { fileName, successCount, failedCount, supplier } = params;
  
  const { error: logError } = await supabase
    .from('import_logs')
    .insert([{
      file_name: fileName,
      import_status: failedCount > 0 ? 'partial' : 'completed',
      products_added: successCount,
      products_updated: 0,
      supplier: supplier || 'excel-import',
      error_message: failedCount > 0 ? `${failedCount} produkter kunde inte importeras` : null
    }]);
    
  if (logError) {
    console.error('Error creating import log:', logError);
  }
};

export const saveMasterProduct = async (masterName: string, averagePrice: number, category?: string | null) => {
  const { data: masterProduct, error: masterError } = await supabase
    .from('master_products')
    .upsert({
      name: masterName,
      base_price: averagePrice,
      category
    }, {
      onConflict: 'name'
    })
    .select()
    .single();

  if (masterError) {
    throw new Error('Error creating master product: ' + masterError.message);
  }

  return masterProduct;
};

export const saveProductVariants = async (variants: any[], masterId: string) => {
  const BATCH_SIZE = 50;
  let successCount = 0;
  let failedCount = 0;

  // Apply categorization to all variants
  const categorizedVariants = batchCategorizeProducts(variants);
  
  for (let i = 0; i < categorizedVariants.length; i += BATCH_SIZE) {
    const batch = categorizedVariants.slice(i, i + BATCH_SIZE).map(variant => ({
      ...variant,
      master_product_id: masterId
    }));
    
    const { error: variantError } = await supabase
      .from('products')
      .upsert(batch, {
        onConflict: 'article_number',
        ignoreDuplicates: false
      });
    
    if (variantError) {
      console.error(`Error in batch ${i/BATCH_SIZE + 1}:`, variantError);
      failedCount += batch.length;
    } else {
      successCount += batch.length;
    }
  }

  return { successCount, failedCount };
};

/**
 * Recategorize existing products in the database
 */
export const categorizeExistingProducts = async () => {
  const BATCH_SIZE = 100;
  let processedCount = 0;
  let updatedCount = 0;
  let currentPage = 0;
  let hasMore = true;
  
  while (hasMore) {
    // Fetch a batch of products
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .range(currentPage * BATCH_SIZE, (currentPage + 1) * BATCH_SIZE - 1);
    
    if (error) {
      console.error('Error fetching products:', error);
      break;
    }
    
    if (!products || products.length === 0) {
      hasMore = false;
      break;
    }
    
    processedCount += products.length;
    
    // Apply categorization
    const categorizedProducts = batchCategorizeProducts(products);
    
    // Update each product
    for (const product of categorizedProducts) {
      const { error: updateError } = await supabase
        .from('products')
        .update({
          category: product.category,
          supplier: product.supplier
        })
        .eq('id', product.id);
      
      if (!updateError) {
        updatedCount++;
      }
    }
    
    currentPage++;
    
    // Check if we're done
    if (products.length < BATCH_SIZE) {
      hasMore = false;
    }
  }
  
  return { processedCount, updatedCount };
};

/**
 * Function to sync categories to the categories table
 */
export const syncCategoriesToTable = async () => {
  // Get all unique categories from products
  const { data: uniqueCategories, error: categoriesError } = await supabase
    .from('products')
    .select('category')
    .not('category', 'is', null)
    .order('category');
  
  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError);
    return { success: false, error: categoriesError };
  }
  
  // Filter out duplicates
  const categorySet = new Set<string>();
  uniqueCategories?.forEach(item => {
    if (item.category) categorySet.add(item.category);
  });
  
  // Insert each unique category into the categories table
  let insertedCount = 0;
  for (const categoryName of categorySet) {
    const { error: insertError } = await supabase
      .from('categories')
      .upsert({
        name: categoryName
      }, {
        onConflict: 'name'
      });
    
    if (!insertError) {
      insertedCount++;
    }
  }
  
  return { 
    success: true, 
    categoriesFound: categorySet.size, 
    categoriesInserted: insertedCount 
  };
};
