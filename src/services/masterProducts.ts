
import { supabase } from "@/integrations/supabase/client";

export const saveMasterProduct = async (
  masterName: string, 
  averagePrice: number, 
  category?: string | null,
  source: string = 'manual'
) => {
  try {
    console.log(`Attempting to create/update master product: ${masterName}`);
    
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
      console.error('Error creating master product:', masterError);
      throw new Error(`Error creating master product: ${masterError.message} (${masterError.code})`);
    }

    if (!masterProduct) {
      throw new Error('No master product returned after creation');
    }

    console.log(`Successfully created/updated master product with ID: ${masterProduct.id}`);
    return masterProduct;
  } catch (error: any) {
    console.error('Exception in saveMasterProduct:', error);
    throw error;
  }
};
