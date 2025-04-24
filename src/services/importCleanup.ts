
import { supabase } from "@/integrations/supabase/client";

export const cleanExcelImportedProducts = async () => {
  try {
    console.log('Starting Excel imported products cleanup');
    
    // Delete product variants with source = 'excel'
    const { error: productsError } = await supabase
      .from('products')
      .delete()
      .eq('source', 'excel');

    if (productsError) {
      console.error('Error deleting Excel products:', productsError);
      console.error(`SQL Error code: ${productsError.code}, Details: ${productsError.details}`);
      return { 
        success: false, 
        message: `Error deleting Excel products: ${productsError.message} (${productsError.code})` 
      };
    }
    
    console.log('Successfully deleted Excel products');

    // Delete master products with source = 'excel'
    const { error: masterError } = await supabase
      .from('master_products')
      .delete()
      .eq('source', 'excel');

    if (masterError) {
      console.error('Error deleting Excel master products:', masterError);
      console.error(`SQL Error code: ${masterError.code}, Details: ${masterError.details}`);
      return { 
        success: false, 
        message: `Error deleting Excel master products: ${masterError.message} (${masterError.code})` 
      };
    }
    
    console.log('Successfully deleted Excel master products');

    return { 
      success: true, 
      message: 'All Excel-imported products successfully deleted' 
    };
  } catch (error: any) {
    console.error('Exception during product cleanup:', error);
    return { 
      success: false, 
      message: `Exception during product cleanup: ${error.message}` 
    };
  }
};
