
export const saveMasterProduct = async (
  masterName: string, 
  averagePrice: number, 
  category?: string | null,
  source: string = 'manual'  // Add source parameter with default
) => {
  const { data: masterProduct, error: masterError } = await supabase
    .from('master_products')
    .upsert({
      name: masterName,
      base_price: averagePrice,
      category,
      source  // Include source
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
  source: string = 'manual'  // Add source parameter with default
) => {
  const BATCH_SIZE = 50;
  let successCount = 0;
  let failedCount = 0;

  const categorizedVariants = batchCategorizeProducts(variants);
  
  for (let i = 0; i < categorizedVariants.length; i += BATCH_SIZE) {
    const batch = categorizedVariants.slice(i, i + BATCH_SIZE).map(variant => ({
      ...variant,
      master_product_id: masterId,
      source  // Include source
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
