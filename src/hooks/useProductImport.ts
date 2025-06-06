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
      console.log('Verifierar databasrättigheter...');
      
      const { data: readData, error: readError } = await supabase
        .from('products')
        .select('id')
        .limit(1);
        
      if (readError) {
        console.error('Behörighetskontroll misslyckades vid läsning:', readError);
        return {
          success: false, 
          message: `Saknar läsrättigheter till produkttabellen: ${readError.message}`
        };
      }
      
      console.log('Läsrättigheter verifierade.');
      
      const testProduct = {
        name: 'TEST_PRODUCT_DELETE_ME',
        article_number: `TEST_${Date.now()}`,
        price: 0,
        source: 'excel_test'
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('products')
        .insert(testProduct)
        .select();
      
      if (insertError) {
        console.error('Behörighetskontroll misslyckades vid skrivning:', insertError);
        return {
          success: false, 
          message: `Saknar skrivrättigheter till produkttabellen: ${insertError.message}`
        };
      }
      
      console.log('Skrivbehörighet verifierad.');
      
      if (insertData && insertData[0]?.id) {
        await supabase.from('products').delete().eq('id', insertData[0].id);
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Fel vid verifiering av databasåtkomst:', error);
      return {
        success: false,
        message: `Kunde inte verifiera databasrättigheter: ${error.message}`
      };
    }
  };

  const handleImport = async (file: File, columnMapping: keyof ColumnMappingType) => {
    let successCount = 0;
    let failedCount = 0;
    let errorDetails = [];
    
    try {
      setIsLoading(true);
      setUploadProgress(10);
      setImportProgress(null);
      setErrorMessage(null);
      
      const accessCheck = await verifyDatabaseAccess();
      if (!accessCheck.success) {
        throw new Error(accessCheck.message || "Kan inte ansluta till databasen eller saknar behörighet. Kontrollera dina behörigheter.");
      }
      
      setUploadProgress(20);
      
      const products = await processExcelFile(file);
      
      if (!products || products.length === 0) {
        throw new Error("Inga produkter hittades i filen");
      }

      console.log("Totalt antal produkter hittade:", products.length);
      
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
      
      const mappedProductResults = products
        .map(product => mapProductData(product, columnMapping, currentMapping))
        .filter(Boolean);
      
      const mappedProducts = mappedProductResults.map(result => 
        typeof result === 'object' && 'product' in result ? result.product : result
      );
      
      if (mappedProducts.length === 0) {
        throw new Error("Inga giltiga produkter att importera efter validering");
      }
      
      setUploadProgress(60);
      
      const groupedProducts = groupProductsByMaster(mappedProducts);
      console.log("Grupperade produkter:", groupedProducts.length);
      
      let specificErrors = [];
      
      for (const group of groupedProducts) {
        const { masterName, variants } = group;
        console.log(`Bearbetar grupp: ${masterName} med ${variants.length} varianter`);
        
        try {
          const averagePrice = variants.reduce((sum: number, v: any) => sum + Number(v.price), 0) / variants.length;
          
          const masterProduct = await saveMasterProduct(
            masterName, 
            averagePrice, 
            variants[0].category,
            'excel'
          );
          
          console.log("Skapade huvudprodukt:", masterProduct);
          
          const saveResult = await saveProductVariants(variants, masterProduct.id, 'excel');
          console.log(`Satsresultat: Lyckade=${saveResult.successCount}, Misslyckade=${saveResult.failedCount}`);
          
          successCount += saveResult.successCount;
          failedCount += saveResult.failedCount;
          
          if (saveResult.errors && saveResult.errors.length > 0) {
            specificErrors.push(...saveResult.errors);
          }
        } catch (error: any) {
          console.error('Fel vid bearbetning av produktgrupp:', error);
          
          if (error.message && error.message.includes('permission denied')) {
            throw new Error("Behörighetsfel: Saknar behörighet att skriva till produkttabellen. Kontakta administratören.");
          }
          
          if (error.message && error.message.includes('violates row-level security policy')) {
            throw new Error("Behörighetsfel: Åtgärden blockeras av row-level security. Kontakta administratören.");
          }
          
          specificErrors.push({
            group: masterName,
            message: error.message,
            code: error.code
          });
          
          failedCount += variants.length;
        }
      }
      
      if (successCount === 0) {
        let detailMsg = "Detta kan bero på databehörigheter eller att det fanns konflikter i artikelnummer.";
        
        if (specificErrors.length > 0) {
          const commonErrors = specificErrors.reduce((acc, curr) => {
            const key = curr.code || curr.message;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
          }, {});
          
          const mostCommonError = Object.entries(commonErrors)
            .sort((a, b) => Number(b[1]) - Number(a[1]))[0];
          
          if (mostCommonError) {
            detailMsg = `Vanligaste felet (${mostCommonError[1]} gånger): ${
              mostCommonError[0].includes('23505') ? 'Artikelnummer måste vara unika' : 
              mostCommonError[0].includes('42501') ? 'Saknar databasbehörighet' : 
              mostCommonError[0]
            }`;
          }
        }
        
        const errorMsg = "Ingen produkt kunde importeras.";
        throw new Error(`${errorMsg} ${detailMsg}`);
      }
      
      const supplierToLog = mappedProducts[0]?.supplier || 'excel-import';
                           
      await saveImportLog({
        fileName: file.name,
        successCount,
        failedCount,
        supplier: supplierToLog
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
      console.error('Fel vid bearbetning av Excel-fil:', error);
      
      let errorMsg = error.message || "Ett fel uppstod vid bearbetning av Excel-filen.";
      
      if (error.code) {
        switch (error.code) {
          case "42501": 
            errorMsg = "Behörighetsfel: Saknar behörighet att skriva till databasen.";
            break;
          case "23505":
            errorMsg = "Unik begränsning misslyckades. Troligen finns artikelnumren redan i databasen.";
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
