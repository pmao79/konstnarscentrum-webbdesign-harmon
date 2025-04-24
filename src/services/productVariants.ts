
import { supabase } from "@/integrations/supabase/client";

export const saveProductVariants = async (
  variants: any[], 
  masterId: string, 
  source: string = 'manual'
) => {
  const BATCH_SIZE = 50;
  let successCount = 0;
  let failedCount = 0;

  try {
    if (!variants || variants.length === 0) {
      return { successCount: 0, failedCount: 0 };
    }

    console.log(`Processing ${variants.length} variants for master ID: ${masterId}`);
    
    for (let i = 0; i < variants.length; i += BATCH_SIZE) {
      const batch = variants.slice(i, i + BATCH_SIZE).map(variant => ({
        ...variant,
        master_product_id: masterId,
        source
      }));
      
      console.log(`Saving batch ${i/BATCH_SIZE + 1} with ${batch.length} variants`);
      
      try {
        const { data, error: variantError } = await supabase
          .from('products')
          .upsert(batch, {
            onConflict: 'article_number',
            ignoreDuplicates: false
          })
          .select();
        
        if (variantError) {
          console.error(`Error in batch ${i/BATCH_SIZE + 1}:`, variantError);
          console.error(`SQL Error code: ${variantError.code}, Details: ${variantError.details}`);
          failedCount += batch.length;
        } else {
          console.log(`Successfully saved ${data?.length || 0} products in batch`);
          successCount += data?.length || 0;
        }
      } catch (batchError: any) {
        console.error(`Exception in batch ${i/BATCH_SIZE + 1}:`, batchError);
        failedCount += batch.length;
      }
    }

    return { successCount, failedCount };
  } catch (error: any) {
    console.error('Exception in saveProductVariants:', error);
    failedCount += variants.length;
    return { successCount, failedCount };
  }
};
