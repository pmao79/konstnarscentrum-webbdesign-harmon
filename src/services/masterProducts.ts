
import { supabase } from "@/integrations/supabase/client";

export const saveMasterProduct = async (
  masterName: string, 
  averagePrice: number, 
  category?: string | null,
  source: string = 'manual'
) => {
  try {
    console.log(`Attempting to create/update master product: ${masterName}`);
    
    // Här korrigerar vi ON CONFLICT för master_products-tabellen
    const { data: masterProduct, error: masterError } = await supabase
      .from('master_products')
      .upsert({
        name: masterName,
        base_price: averagePrice,
        category,
        source
      }, {
        onConflict: 'name'  // Säkerställer att vi använder rätt kolumnnamn 
      })
      .select()
      .single();

    if (masterError) {
      console.error('Error creating master product:', masterError);
      // Logga detaljerad information för felsökning
      if (masterError.code === '42P10') {
        console.error('ON CONFLICT constraint error details:', {
          message: masterError.message,
          details: masterError.details,
          code: masterError.code
        });
      }
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

