import { supabase } from "@/integrations/supabase/client";
import { batchCategorizeProducts, categorizeProduct, getCategoryFromName, cleanSupplierName } from "@/utils/productCategorization";

export const saveMasterProduct = async (
  masterName: string, 
  averagePrice: number, 
  category?: string | null,
  source: string = 'manual'
) => {
  const { data: masterProduct, error: masterError } = await supabase
    .from('master_products')
    .upsert({
      name: masterName,
      base_price: averagePrice,
      category,
      source
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

export const saveProductVariants = async (
  variants: any[], 
  masterId: string, 
  source: string = 'manual'
) => {
  const BATCH_SIZE = 50;
  let successCount = 0;
  let failedCount = 0;

  const categorizedVariants = batchCategorizeProducts(variants);
  
  for (let i = 0; i < categorizedVariants.length; i += BATCH_SIZE) {
    const batch = categorizedVariants.slice(i, i + BATCH_SIZE).map(variant => ({
      ...variant,
      master_product_id: masterId,
      source
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

export const saveImportLog = async (logData: {
  fileName: string;
  successCount: number;
  failedCount: number;
  supplier?: string | null;
}) => {
  const { error } = await supabase
    .from('import_logs')
    .insert({
      file_name: logData.fileName,
      products_added: logData.successCount,
      products_updated: 0,
      import_status: 'completed',
      supplier: logData.supplier
    });

  if (error) {
    console.error('Error saving import log:', error);
  }
};

export const cleanExcelImportedProducts = async () => {
  try {
    // Delete product variants with source = 'excel'
    const { error: productsError } = await supabase
      .from('products')
      .delete()
      .eq('source', 'excel');

    if (productsError) {
      return { 
        success: false, 
        message: 'Error deleting Excel products: ' + productsError.message 
      };
    }

    // Delete master products with source = 'excel'
    const { error: masterError } = await supabase
      .from('master_products')
      .delete()
      .eq('source', 'excel');

    if (masterError) {
      return { 
        success: false, 
        message: 'Error deleting Excel master products: ' + masterError.message 
      };
    }

    return { 
      success: true, 
      message: 'All Excel-imported products successfully deleted' 
    };
  } catch (error: any) {
    return { 
      success: false, 
      message: 'Exception during product cleanup: ' + error.message 
    };
  }
};

export const categorizeExistingProducts = async () => {
  try {
    let processedCount = 0;
    let updatedCount = 0;
    
    // Fetch products without categories
    const { data: products, error } = await supabase
      .from('products')
      .select('*');
      
    if (error) {
      throw new Error('Error fetching products: ' + error.message);
    }
    
    if (!products || products.length === 0) {
      return { processedCount: 0, updatedCount: 0 };
    }
    
    // Process in batches
    const BATCH_SIZE = 50;
    processedCount = products.length;
    
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      const updatedBatch = batch.map(product => {
        const categorizedProduct = categorizeProduct(product);
        // Check if categorization made any changes
        const hasChanged = 
          product.category !== categorizedProduct.category ||
          (categorizedProduct.subcategory !== undefined && product.category !== categorizedProduct.subcategory);
          
        if (hasChanged) {
          updatedCount++;
        }
        
        return {
          ...categorizedProduct,
          id: product.id,
          article_number: product.article_number,
          name: product.name,
          price: product.price,
          stock_status: product.stock_status,
          source: product.source
        };
      });
      
      // Update products in database
      const { error: updateError } = await supabase
        .from('products')
        .upsert(updatedBatch, {
          onConflict: 'id'
        });
      
      if (updateError) {
        console.error(`Error updating batch ${i/BATCH_SIZE + 1}:`, updateError);
      }
    }
    
    return { processedCount, updatedCount };
  } catch (error: any) {
    console.error('Error categorizing products:', error);
    throw error;
  }
};

export const syncCategoriesToTable = async () => {
  try {
    // Get all unique categories from products
    const { data: products, error } = await supabase
      .from('products')
      .select('category');
      
    if (error) {
      throw new Error('Error fetching product categories: ' + error.message);
    }
    
    // Extract unique categories
    const categories = Array.from(
      new Set(
        products
          .filter(p => p.category)
          .map(p => p.category)
      )
    );
    
    let categoriesInserted = 0;
    
    // Insert categories in batches
    for (const category of categories) {
      const { data, error: checkError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', category)
        .maybeSingle();
        
      if (!checkError && !data) {
        // Insert new category
        const { error: insertError } = await supabase
          .from('categories')
          .insert({ name: category });
          
        if (!insertError) {
          categoriesInserted++;
        }
      }
    }
    
    return {
      categoriesFound: categories.length,
      categoriesInserted
    };
  } catch (error: any) {
    console.error('Error syncing categories:', error);
    throw error;
  }
};
