
import { supabase } from "@/integrations/supabase/client";
import { categorizeProduct } from "@/utils/productCategorization";

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

    // Process products in batches to avoid hitting rate limits
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      const categorizedBatch = batch.map(product => {
        const categorizedProduct = categorizeProduct(product);
        
        // Check if any categorization fields changed
        const hasChanged = 
          categorizedProduct.category !== product.category ||
          categorizedProduct.subcategory !== product.subcategory ||
          categorizedProduct.supplier !== product.supplier;
          
        if (hasChanged) updatedCount++;
        
        return categorizedProduct;
      });

      // Update categorized products in the database
      const { error: updateError } = await supabase
        .from('products')
        .upsert(categorizedBatch, { onConflict: 'id' });

      if (updateError) {
        console.error(`Error updating batch ${i/BATCH_SIZE + 1}:`, updateError);
        throw new Error(`Error updating products: ${updateError.message}`);
      }
      
      console.log(`Processed and updated batch ${i/BATCH_SIZE + 1} (${batch.length} products)`);
    }
    
    console.log(`Categorization complete. Processed ${products.length} products, updated ${updatedCount} products`);
    return { processedCount: products.length, updatedCount };
    
  } catch (error: any) {
    console.error('Exception during product categorization:', error);
    throw new Error(`Categorization failed: ${error.message}`);
  }
};

/**
 * Extract all unique categories from products and sync them to the categories table
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
    
    // For each unique category, check if it exists in categories table and insert if not
    let categoriesInserted = 0;
    
    for (const category of uniqueCategories) {
      // Check if category already exists
      const { data: existing, error: checkError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', category)
        .maybeSingle();
        
      if (checkError) {
        console.error(`Error checking if category "${category}" exists:`, checkError);
        continue;
      }
      
      // If category doesn't exist, insert it
      if (!existing) {
        const { error: insertError } = await supabase
          .from('categories')
          .insert({
            name: category,
            description: `Auto-generated category from product categorization`
          });
          
        if (insertError) {
          console.error(`Error inserting category "${category}":`, insertError);
          continue;
        }
        
        categoriesInserted++;
        console.log(`Added new category: ${category}`);
      } else {
        console.log(`Category already exists: ${category}`);
      }
    }
    
    return { 
      categoriesFound: uniqueCategories.length, 
      categoriesInserted 
    };
    
  } catch (error: any) {
    console.error('Exception during category synchronization:', error);
    throw new Error(`Category synchronization failed: ${error.message}`);
  }
};
