
import { useToast } from "@/hooks/use-toast";
import { processExcelFile } from '@/utils/excelProcessing';
import { groupProductsByMaster } from '@/utils/productVariants';
import { validateProducts } from '@/utils/importValidation';
import { mapProductData } from '@/utils/productMapping';
import { saveImportLog, saveMasterProduct, saveProductVariants } from '@/services/importService';
import { useImportProgress } from '@/hooks/useImportProgress';
import type { ColumnMappingType, ImportProgress } from '@/types/importing';
import { COLUMN_MAPPINGS } from '@/types/importing';

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

  const handleImport = async (file: File, columnMapping: keyof ColumnMappingType) => {
    let successCount = 0;
    let failedCount = 0;
    
    try {
      setIsLoading(true);
      setUploadProgress(10);
      setImportProgress(null);
      setErrorMessage(null);
      
      setUploadProgress(30);
      const products = await processExcelFile(file);
      
      if (!products || products.length === 0) {
        throw new Error("Inga produkter hittades i filen");
      }

      console.log("Total products found:", products.length);
      
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
      
      setUploadProgress(50);
      
      const mappedProducts = products
        .map(product => mapProductData(product, columnMapping, currentMapping))
        .filter(Boolean);
      
      if (mappedProducts.length === 0) {
        throw new Error("Inga giltiga produkter att importera efter validering");
      }
      
      setUploadProgress(70);
      const groupedProducts = groupProductsByMaster(mappedProducts);
      
      for (const group of groupedProducts) {
        const { masterName, variants } = group;
        const averagePrice = variants.reduce((sum: number, v: any) => sum + v.price, 0) / variants.length;
        
        try {
          const masterProduct = await saveMasterProduct(masterName, averagePrice, variants[0].category);
          const { successCount: batchSuccess, failedCount: batchFailed } = 
            await saveProductVariants(variants, masterProduct.id);
          
          successCount += batchSuccess;
          failedCount += batchFailed;
        } catch (error) {
          console.error('Error processing product group:', error);
          failedCount += variants.length;
        }
      }
      
      if (successCount === 0) {
        throw new Error("Ingen produkt kunde importeras. Kontrollera dina behörigheter och försök igen.");
      }
      
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
      setErrorMessage(`Bearbetningsfel: ${error.message}`);
      toast({
        title: "Bearbetningsfel",
        description: error.message || "Ett fel uppstod vid bearbetning av Excel-filen.",
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
