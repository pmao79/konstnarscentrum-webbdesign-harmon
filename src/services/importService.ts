
import { supabase } from "@/integrations/supabase/client";

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

  for (let i = 0; i < variants.length; i += BATCH_SIZE) {
    const batch = variants.slice(i, i + BATCH_SIZE).map(variant => ({
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
