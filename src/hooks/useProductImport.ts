import { useToast } from "@/hooks/use-toast";
import { processExcelFile } from '@/utils/excelProcessing';
import { groupProductsByMaster } from '@/utils/productVariants';
import { validateProducts } from '@/utils/importValidation';
import { mapProductData } from '@/utils/productMapping';
import { 
  saveImportLog, 
  saveMasterProduct, 
  saveProductVariants 
} from '@/services/importService';
import { useImportProgress } from '@/hooks/useImportProgress';
import type { ColumnMappingType, ImportProgress } from '@/types/importing';
import { COLUMN_MAPPINGS } from '@/types/importing';
import { supabase } from "@/integrations/supabase/client";

export const useProductImport = () => {
  const { toast } = useToast();
  const {
    isLoading,
    setIsLoading,
    uploadProgress,
    setUploadProgress,
    selectedFile,
    setSelectedFile,
    importProgress,
    setImportProgress,
    errorMessage,
    setErrorMessage
  } = useImportProgress();

  const verifyDatabaseAccess = async () => {
    try {
      // Test permissions by attempting to read from categories table
      const { data, error } = await supabase
        .from('categories')
        .select('id')
        .limit(1);
        
      if (error) {
        console.error('Permission check failed on read:', error);
        return false;
      }
      
      // If user can read but we're not sure about write permissions,
      // we'll still proceed and handle specific write errors later
      return true;
    } catch (error) {
      console.error('Error verifying database access:', error);
      return false;
    }
  };

  const handleImport = async (file: File, columnMapping: keyof ColumnMappingType) => {
    let successCount = 0;
    let failedCount = 0;
    
    try {
      setIsLoading(true);
      setUploadProgress(10);
      setImportProgress(null);
      setErrorMessage(null);
      
      // Check database access first
      const hasAccess = await verifyDatabaseAccess();
      if (!hasAccess) {
        throw new Error("Kan inte ansluta till databasen eller saknar läsbehörighet. Kontrollera dina behörigheter.");
      }
      
      setUploadProgress(20);
      // Process Excel file
      const products = await processExcelFile(file);
      
      if (!products || products.length === 0) {
        throw new Error("Inga produkter hittades i filen");
      }

      console.log("Total products found:", products.length);
      
      // Basic validation
      const currentMapping = COLUMN_MAPPINGS[columnMapping];
      let firstProduct = products[0];
      let missingColumns = [];
      
      if (!firstProduct[currentMapping.articleNumber]) 
        missingColumns.push(currentMapping.articleNumber);
      if (!firstProduct[currentMapping.productName]) 
        missingColumns.push(currentMapping.productName);
      if (!firstProduct[currentMapping.price]) 
        missingColumns.push(currentMapping.price);
        
      if (missingColumns.length > 0) {
        throw new Error(`Saknade kolumner i Excel-filen: ${missingColumns.join(", ")}. Kontrollera formatet och kolumnnamnen.`);
      }
      
      // Detailed validation
      const validationErrors = validateProducts(products, currentMapping);
      const progressData: ImportProgress = {
        total: products.length,
        processed: 0,
        successful: 0,
        failed: 0,
        validationErrors
      };
      
      setImportProgress(progressData);
      
      if (validationErrors.length > 0) {
        setUploadProgress(100);
        toast({
          title: "Valideringsfel",
          description: `${validationErrors.length} fel hittades i importen. Se detaljer nedan.`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      setUploadProgress(40);
      
      // Map products
      const mappedProducts = products
        .map(product => mapProductData(product, columnMapping, currentMapping))
        .filter(Boolean);
      
      if (mappedProducts.length === 0) {
        throw new Error("Inga giltiga produkter att importera efter validering");
      }
      
      setUploadProgress(60);
      
      // Group products
      const groupedProducts = groupProductsByMaster(mappedProducts);
      console.log("Grouped products:", groupedProducts.length);
      
      // Process each group
      for (const group of groupedProducts) {
        const { masterName, variants } = group;
        console.log(`Processing group: ${masterName} with ${variants.length} variants`);
        
        try {
          const averagePrice = variants.reduce((sum: number, v: any) => sum + v.price, 0) / variants.length;
          
          // Create master product
          const masterProduct = await saveMasterProduct(
            masterName, 
            averagePrice, 
            variants[0].category,
            'excel'
          );
          
          console.log("Created master product:", masterProduct);
          
          // Save variants
          const { successCount: batchSuccess, failedCount: batchFailed } = 
            await saveProductVariants(variants, masterProduct.id, 'excel');
          
          console.log(`Batch result: Success=${batchSuccess}, Failed=${batchFailed}`);
          successCount += batchSuccess;
          failedCount += batchFailed;
        } catch (error: any) {
          console.error('Error processing product group:', error);
          
          // Check for specific error types
          if (error.message && error.message.includes('permission denied')) {
            throw new Error("Behörighetsfel: Saknar behörighet att skriva till produkttabellen. Kontakta administratören.");
          }
          
          if (error.message && error.message.includes('violates row-level security policy')) {
            throw new Error("Behörighetsfel: Åtgärden blockeras av row-level security. Kontakta administratören.");
          }
          
          failedCount += variants.length;
        }
      }
      
      if (successCount === 0) {
        throw new Error("Ingen produkt kunde importeras. Detta kan bero på databehörigheter eller att det fanns konflikter i artikelnummer. Kontrollera dina behörigheter och försök igen.");
      }
      
      // Log import result
      await saveImportLog({
        fileName: file.name,
        successCount,
        failedCount,
        supplier: mappedProducts[0]?.supplier
      });
      
      setUploadProgress(100);
      setSelectedFile(null);
      setErrorMessage(null);
      
      if (failedCount > 0) {
        toast({
          title: "Import delvis slutförd",
          description: `${successCount} produkter har importerats framgångsrikt. ${failedCount} produkter kunde inte importeras.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Import slutförd",
          description: `${successCount} produkter har importerats/uppdaterats.`,
        });
      }
      
    } catch (error: any) {
      console.error('Error processing Excel file:', error);
      
      // Enhanced error handling
      let errorMsg = error.message || "Ett fel uppstod vid bearbetning av Excel-filen.";
      
      // Check for common database issues
      if (error.code) {
        switch (error.code) {
          case "42501": 
            errorMsg = "Behörighetsfel: Saknar behörighet att skriva till databasen.";
            break;
          case "23505":
            errorMsg = "Unik begränsning misslyckades. Troligen finns redan produkten i databasen.";
            break;
          case "23503":
            errorMsg = "Referensfel. Kan inte skapa produkt eftersom en relaterad post saknas.";
            break;
          default:
            if (error.code.startsWith("42") || error.code.startsWith("28")) {
              errorMsg = `Behörighetsfel (${error.code}): Kontakta administratören.`;
            }
        }
      }
      
      setErrorMessage(`Bearbetningsfel: ${errorMsg}`);
      toast({
        title: "Bearbetningsfel",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    uploadProgress,
    selectedFile,
    setSelectedFile,
    importProgress,
    errorMessage,
    handleImport
  };
};
