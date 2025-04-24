
import { supabase } from "@/integrations/supabase/client";

export const saveImportLog = async (logData: {
  fileName: string;
  successCount: number;
  failedCount: number;
  supplier?: string | null;
}) => {
  try {
    console.log(`Saving import log: ${JSON.stringify(logData)}`);
    
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
      console.error(`SQL Error code: ${error.code}, Details: ${error.details}`);
    } else {
      console.log('Import log saved successfully');
    }
  } catch (error: any) {
    console.error('Exception saving import log:', error);
  }
};
