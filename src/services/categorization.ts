
import { supabase } from "@/integrations/supabase/client";
import { categorizeProduct, batchCategorizeProducts } from "@/utils/productCategorization";

/**
 * Categorize all existing products in the database
 * This function will analyze product names and update category, subcategory, and brand fields
 */
export const categorizeExistingProducts = async () => {
  try {
    console.log('Starting categorization of existing products');
    
    // First, fetch all products from the database
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('*');

    if (fetchError) {
      console.error('Error fetching products for categorization:', fetchError);
      throw new Error(`Error fetching products: ${fetchError.message}`);
    }

    if (!products || products.length === 0) {
      console.log('No products found to categorize');
      return { processedCount: 0, updatedCount: 0 };
    }

    console.log(`Found ${products.length} products to analyze for categorization`);
    
    let updatedCount = 0;
    const BATCH_SIZE = 50;
    let uniqueCategories = new Set<string>();
    let uniqueSubcategories = new Set<string>();
    let uniqueBrands = new Set<string>();

    // Process products in batches to avoid hitting rate limits
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      
      // Use the improved batch categorization that tracks modifications
      const { products: categorizedBatch, modifiedCount } = batchCategorizeProducts(batch);
      updatedCount += modifiedCount;
      
      // Collect unique categories, subcategories, and brands for reporting
      categorizedBatch.forEach(product => {
        if (product.category) uniqueCategories.add(product.category);
        if (product.variant_type) uniqueSubcategories.add(product.variant_type);
        if (product.supplier) uniqueBrands.add(product.supplier);
      });

      // Only update if at least one product was modified
      if (modifiedCount > 0) {
        // Update categorized products in the database
        const { error: updateError } = await supabase
          .from('products')
          .upsert(categorizedBatch, { onConflict: 'id' });

        if (updateError) {
          console.error(`Error updating batch ${i/BATCH_SIZE + 1}:`, updateError);
          throw new Error(`Error updating products: ${updateError.message}`);
        }
      }
      
      console.log(`Processed and updated batch ${i/BATCH_SIZE + 1} (${batch.length} products)`);
    }
    
    console.log(`Categorization complete. Processed ${products.length} products, updated ${updatedCount} products`);
    
    // Return summary information
    return { 
      processedCount: products.length, 
      updatedCount,
      categories: Array.from(uniqueCategories),
      subcategories: Array.from(uniqueSubcategories),
      brands: Array.from(uniqueBrands)
    };
    
  } catch (error: any) {
    console.error('Exception during product categorization:', error);
    throw new Error(`Categorization failed: ${error.message}`);
  }
};

/**
 * Extract all unique categories from products and sync them to the categories table
 * This function is modified to handle permission issues gracefully
 */
export const syncCategoriesToTable = async () => {
  try {
    console.log('Starting category synchronization');
    
    // Fetch all distinct categories from products table
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('products')
      .select('category')
      .not('category', 'is', null);
      
    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      throw new Error(`Error fetching categories: ${categoriesError.message}`);
    }
    
    // Extract unique categories
    const uniqueCategories = [...new Set(
      categoriesData
        .map(item => item.category)
        .filter(category => category && category.trim() !== '')
    )];
    
    console.log(`Found ${uniqueCategories.length} unique categories to sync`);
    
    // Don't attempt to modify the categories table if there are permission issues
    // Instead just return the categories we found
    return { 
      categoriesFound: uniqueCategories.length, 
      categoriesInserted: 0,
      categories: uniqueCategories
    };
    
  } catch (error: any) {
    console.error('Exception during category synchronization:', error);
    throw new Error(`Category synchronization failed: ${error.message}`);
  }
};
