
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { processExcelFile, validateProducts } from '@/utils/excelProcessing';
import { groupProductsByMaster } from '@/utils/productVariants';
import type { ImportProgress, ColumnMappingType } from '@/types/importing';
import { COLUMN_MAPPINGS } from '@/types/importing';

export const useProductImport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

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
      
      const mappedProducts = products.map(product => {
        if (!product || Object.keys(product).length === 0) return null;
        
        const price = Number(String(product[currentMapping.price]).replace(',', '.'));
        let stockStatus = 0;
        let category = null;
        let supplier = product[currentMapping.supplier] || null;
        let description = '';
        let imageUrl = null;
        
        // Handle mapping specific fields
        if (columnMapping === "swedish") {
          const swedishMapping = currentMapping as typeof COLUMN_MAPPINGS['swedish'];
          stockStatus = product[swedishMapping.packaging] 
            ? parseInt(String(product[swedishMapping.packaging]).replace(/\s/g, '')) || 0 
            : 0;
          description = product[swedishMapping.misc] || '';
          
          const brandParts = supplier ? String(supplier).split(' - ') : [];
          if (brandParts.length > 1) {
            category = brandParts[0].trim();
          }
        } else if (columnMapping === "english") {
          const englishMapping = currentMapping as typeof COLUMN_MAPPINGS['english'];
          stockStatus = product[englishMapping.stockStatus] || 0;
          description = product[englishMapping.description] || '';
          category = product[englishMapping.category] || null;
          imageUrl = product[englishMapping.imageUrl] || null;
        }
        
        return {
          article_number: String(product[currentMapping.articleNumber]),
          name: String(product[currentMapping.productName]),
          description,
          price,
          stock_status: stockStatus,
          image_url: imageUrl,
          category,
          supplier
        };
      }).filter(Boolean);
      
      if (mappedProducts.length === 0) {
        throw new Error("Inga giltiga produkter att importera efter validering");
      }
      
      setUploadProgress(70);
      const groupedProducts = groupProductsByMaster(mappedProducts);
      
      for (const group of groupedProducts) {
        const { masterName, variants } = group;
        const averagePrice = variants.reduce((sum: number, v: any) => sum + v.price, 0) / variants.length;
        
        const { data: masterProduct, error: masterError } = await supabase
          .from('master_products')
          .upsert({
            name: masterName,
            base_price: averagePrice,
            category: variants[0].category
          }, {
            onConflict: 'name'
          })
          .select()
          .single();
        
        if (masterError) {
          console.error('Error creating master product:', masterError);
          failedCount += variants.length;
          continue;
        }
        
        const variantUpdates = variants.map(variant => ({
          ...variant,
          master_product_id: masterProduct.id
        }));
        
        const BATCH_SIZE = 50;
        for (let i = 0; i < variantUpdates.length; i += BATCH_SIZE) {
          const batch = variantUpdates.slice(i, i + BATCH_SIZE);
          
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
      }
      
      if (successCount === 0) {
        throw new Error("Ingen produkt kunde importeras. Kontrollera dina behörigheter och försök igen.");
      }
      
      const { error: logError } = await supabase
        .from('import_logs')
        .insert([{
          file_name: file.name,
          import_status: failedCount > 0 ? 'partial' : 'completed',
          products_added: successCount,
          products_updated: 0,
          supplier: mappedProducts[0]?.supplier || 'excel-import',
          error_message: failedCount > 0 ? `${failedCount} produkter kunde inte importeras` : null
        }]);
        
      if (logError) {
        console.error('Error creating import log:', logError);
      }
      
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
