
import { supabase } from "@/integrations/supabase/client";

export const saveProductVariants = async (
  variants: any[], 
  masterId: string, 
  source: string = 'manual'
) => {
  const BATCH_SIZE = 50;
  let successCount = 0;
  let failedCount = 0;
  let errors: any[] = [];

  try {
    if (!variants || variants.length === 0) {
      return { successCount: 0, failedCount: 0, errors: [] };
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
          errors.push({
            batchIndex: i/BATCH_SIZE + 1,
            code: variantError.code,
            message: variantError.message,
            details: variantError.details
          });
        } else {
          console.log(`Successfully saved ${data?.length || 0} products in batch`);
          successCount += data?.length || 0;
          
          // Om antalet uppdaterade rader är mindre än batchstorlek, räkna resten som misslyckade
          if (data && data.length < batch.length) {
            const missingCount = batch.length - data.length;
            console.warn(`${missingCount} produkter i batchen verkar inte ha uppdaterats`);
            failedCount += missingCount;
            errors.push({
              batchIndex: i/BATCH_SIZE + 1,
              code: 'INCOMPLETE_BATCH',
              message: `${missingCount} produkter bearbetades inte`,
              details: 'Några produkter i batchen kunde inte sparas'
            });
          }
        }
      } catch (batchError: any) {
        console.error(`Exception in batch ${i/BATCH_SIZE + 1}:`, batchError);
        failedCount += batch.length;
        errors.push({
          batchIndex: i/BATCH_SIZE + 1,
          message: batchError.message,
          stack: batchError.stack
        });
      }
    }

    return { successCount, failedCount, errors };
  } catch (error: any) {
    console.error('Exception in saveProductVariants:', error);
    failedCount += variants.length;
    return { 
      successCount, 
      failedCount, 
      errors: [{
        general: true,
        message: error.message,
        stack: error.stack
      }]
    };
  }
};
