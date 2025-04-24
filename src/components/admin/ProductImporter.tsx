import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { Loader2, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { groupProductsByMaster, extractMasterProductInfo } from '@/utils/productVariants';

interface ImportProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  validationErrors: Array<{row: number; field: string; message: string}>;
}

interface ColumnMapping {
  articleNumber: string;
  productName: string;
  description?: string;
  price: string;
  stockStatus?: string;
  category?: string;
  imageUrl?: string;
  supplier?: string;
  packaging?: string;
  unit?: string;
  ean?: string;
  code?: string;
  brand?: string;
  misc?: string;
}

const COLUMN_MAPPINGS = {
  swedish: {
    articleNumber: "Artikelnummer",
    productName: "Benämning",
    price: "Cirkapris",
    packaging: "Förp",
    unit: "Enhet",
    ean: "EAN",
    code: "Kod",
    misc: "Övrigt",
    supplier: "Varumärke"
  },
  english: {
    articleNumber: "Article Number",
    productName: "Product Name",
    description: "Description",
    price: "Price",
    stockStatus: "Stock Status",
    imageUrl: "Image URL",
    category: "Category",
    supplier: "Supplier"
  }
} as const;

const ProductImporter = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [lastSuccessfulImport, setLastSuccessfulImport] = useState<{date: string, count: number} | null>(null);
  const [columnMapping, setColumnMapping] = useState<"swedish" | "english">("swedish");
  const { toast } = useToast();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const getLastImport = async () => {
      try {
        const { data, error } = await supabase
          .from('import_logs')
          .select('created_at, products_added')
          .eq('import_status', 'completed')
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error fetching import logs:', error);
          return;
        }

        if (data && data.length > 0) {
          setLastSuccessfulImport({
            date: data[0].created_at,
            count: data[0].products_added
          });
        }
      } catch (err) {
        console.error('Exception fetching import logs:', err);
      }
    };
    
    getLastImport();
  }, []);

  const validateProducts = (products: any[], mapping: ColumnMapping) => {
    const errors: Array<{row: number; field: string; message: string}> = [];
    
    products.forEach((product, index) => {
      if (!product || Object.keys(product).length === 0) {
        return;
      }
      
      if (!product[mapping.articleNumber]) {
        errors.push({row: index + 2, field: mapping.articleNumber, message: 'Artikelnummer måste anges'});
      }
      
      if (!product[mapping.productName]) {
        errors.push({row: index + 2, field: mapping.productName, message: 'Produktnamn måste anges'});
      }
      
      const priceValue = product[mapping.price];
      if (priceValue !== 0 && !priceValue) {
        errors.push({row: index + 2, field: mapping.price, message: 'Pris måste anges'});
      } else {
        const priceStr = String(priceValue).replace(',', '.');
        if (isNaN(parseFloat(priceStr))) {
          errors.push({row: index + 2, field: mapping.price, message: 'Pris måste vara ett numeriskt värde'});
        }
      }
      
      const packagingField = mapping.packaging;
      if (packagingField && product[packagingField] && 
          isNaN(parseInt(String(product[packagingField]).replace(/\s/g, '')))) {
        errors.push({row: index + 2, field: packagingField, message: 'Förpackning måste vara ett heltal'});
      }
    });
    
    return errors;
  };

  const cleanNumericValue = (value: any): number => {
    if (value === undefined || value === null) return 0;
    
    let strValue = String(value);
    
    strValue = strValue.replace(',', '.');
    
    strValue = strValue.replace(/[^\d.]/g, '');
    
    const numValue = parseFloat(strValue);
    return isNaN(numValue) ? 0 : numValue;
  };

  const mapProductToDatabase = (product: any, mapping: ColumnMapping) => {
    if (!product || Object.keys(product).length === 0) {
      return null;
    }
    
    if (!product[mapping.articleNumber] || !product[mapping.productName]) {
      console.warn("Skipping product without required fields:", product);
      return null;
    }
    
    const price = cleanNumericValue(product[mapping.price]);
    const packagingValue = mapping.packaging && product[mapping.packaging] 
      ? parseInt(String(product[mapping.packaging]).replace(/\s/g, '')) || 0 
      : 0;
    
    let category = null;
    let supplier = product[mapping.supplier] || null;
    
    if (columnMapping === "swedish" && supplier) {
      const brandParts = String(supplier).split(' - ');
      if (brandParts.length > 1) {
        category = brandParts[0].trim();
      }
    } else if (mapping.category) {
      category = product[mapping.category] || null;
    }
    
    const description = mapping.misc ? product[mapping.misc] || '' 
                      : mapping.description ? product[mapping.description] || ''
                      : '';
                      
    const imageUrl = mapping.imageUrl ? product[mapping.imageUrl] : null;

    const similarProducts = products.filter(p => 
      p[mapping.productName].toLowerCase().startsWith(
        product[mapping.productName].split(' ').slice(0, 3).join(' ').toLowerCase()
      )
    );

    const masterInfo = extractMasterProductInfo(product[mapping.productName], similarProducts);
    
    return {
      article_number: String(product[mapping.articleNumber]),
      name: String(product[mapping.productName]),
      description: description,
      price: price,
      stock_status: packagingValue,
      image_url: imageUrl,
      category: category,
      supplier: supplier,
      master_name: masterInfo?.masterName || null,
      variant_name: masterInfo?.variantName || null
    };
  };

  const processExcelFile = async (file: File) => {
    try {
      setIsLoading(true);
      setUploadProgress(10);
      setImportProgress(null);
      setErrorMessage(null);
      
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          setUploadProgress(30);
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          
          const products = XLSX.utils.sheet_to_json(firstSheet, {
            defval: null,
            raw: true
          });
          
          setUploadProgress(40);
          
          if (!products || products.length === 0) {
            throw new Error("Inga produkter hittades i filen");
          }

          console.log("Total products found:", products.length);
          console.log("First product from Excel:", products[0]);
          
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
          
          console.log(`Processar ${products.length} produkter från Excel`);
          
          setUploadProgress(50);
          
          const mappedProducts = products
            .map(product => mapProductToDatabase(product, currentMapping))
            .filter(Boolean);
          
          console.log(`Efter mappning: ${mappedProducts.length} giltiga produkter`);
          
          if (mappedProducts.length === 0) {
            throw new Error("Inga giltiga produkter att importera efter validering");
          }
          
          setUploadProgress(70);
          
          const groupedProducts = groupProductsByMaster(mappedProducts);
          
          try {
            for (const group of groupedProducts) {
              const { masterName, variants } = group;
              
              const averagePrice = variants.reduce((sum, v) => sum + v.price, 0) / variants.length;
              
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
              
            const importDate = new Date().toISOString();
            setLastSuccessfulImport({
              date: importDate,
              count: successCount
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
          } catch (dbError: any) {
            console.error('Database error during import:', dbError);
            setErrorMessage(`Databasfel: ${dbError.message || 'Okänt fel vid import'}`);
            
            toast({
              title: "Import misslyckades",
              description: `Ett databasfel uppstod: ${dbError.message || 'Okänt fel'}`,
              variant: "destructive",
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
      
      reader.onerror = () => {
        setErrorMessage("Kunde inte läsa Excel-filen.");
        toast({
          title: "Läsfel",
          description: "Kunde inte läsa Excel-filen.",
          variant: "destructive",
        });
        setIsLoading(false);
      };

      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      console.error('Import error:', error);
      setErrorMessage(`Import misslyckades: ${error.message}`);
      toast({
        title: "Import misslyckades",
        description: "Ett fel uppstod vid import av produkter.",
        variant: "destructive",
      });
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrorMessage(null);
      
      setImportProgress(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-serif">Importera produkter</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="grid gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="column-format">Välj kolumnformat</Label>
              <Select 
                value={columnMapping} 
                onValueChange={(value) => setColumnMapping(value as "swedish" | "english")}
              >
                <SelectTrigger id="column-format" className="w-[180px]">
                  <SelectValue placeholder="Välj format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="swedish">Svenska kolumner</SelectItem>
                    <SelectItem value="english">Engelska kolumner</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                disabled={isLoading}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                {isLoading ? 'Väljer fil...' : 'Välj Excel-fil'}
              </Button>
              <input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileUpload}
              />
              <p className="text-sm text-muted-foreground">
                Stödjer Excel-filer (.xlsx, .xls)
              </p>
            </div>
          </div>
          
          {lastSuccessfulImport && !isLoading && !selectedFile && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>
                Senaste import: {formatDistanceToNow(new Date(lastSuccessfulImport.date), { addSuffix: true, locale: sv })} 
                ({lastSuccessfulImport.count} produkter)
              </span>
            </div>
          )}
          
          {selectedFile && !isLoading && (
            <div className="flex items-center gap-4">
              <p className="text-sm">Vald fil: <span className="font-medium">{selectedFile.name}</span></p>
              <Button 
                onClick={() => processExcelFile(selectedFile)}
                disabled={isLoading}
              >
                Importera nu
              </Button>
            </div>
          )}
          
          {isLoading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm font-medium">Importerar produkter...</p>
              </div>
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-xs text-muted-foreground text-right">{uploadProgress}%</p>
            </div>
          )}
          
          {errorMessage && (
            <div className="mt-4 border rounded-md p-4 bg-destructive/10">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <h3 className="font-medium">Felmeddelande</h3>
              </div>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
            </div>
          )}
          
          {importProgress && importProgress.validationErrors.length > 0 && (
            <div className="mt-4 border rounded-md p-4 bg-destructive/10">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <h3 className="font-medium">Valideringsfel</h3>
              </div>
              <ul className="space-y-1 text-sm">
                {importProgress.validationErrors.slice(0, 5).map((error, idx) => (
                  <li key={idx} className="text-muted-foreground">
                    Rad {error.row}: {error.field} - {error.message}
                  </li>
                ))}
                {importProgress.validationErrors.length > 5 && (
                  <li className="text-muted-foreground">
                    ...och {importProgress.validationErrors.length - 5} till
                  </li>
                )}
              </ul>
            </div>
          )}
          
          <div className="border-t pt-4 text-sm">
            <h4 className="font-medium mb-2">Importformat</h4>
            {columnMapping === "swedish" ? (
              <>
                <p className="text-muted-foreground mb-2">
                  Din Excel-fil följer detta format:
                </p>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                  <li>Artikelnummer (obligatorisk)</li>
                  <li>Benämning (obligatorisk)</li>
                  <li>Förp (används som lagerstatus)</li>
                  <li>Enhet</li>
                  <li>Cirkapris (obligatorisk)</li>
                  <li>EAN</li>
                  <li>Kod</li>
                  <li>Varumärke (används som kategori/leverantör)</li>
                  <li>Övrigt (används som beskrivning)</li>
                </ul>
              </>
            ) : (
              <>
                <p className="text-muted-foreground mb-2">
                  Excelfilens första rad måste innehålla följande kolumner:
                </p>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                  <li>Article Number (obligatorisk)</li>
                  <li>Product Name (obligatorisk)</li>
                  <li>Description</li>
                  <li>Price (obligatorisk)</li>
                  <li>Stock Status</li>
                  <li>Category</li>
                  <li>Image URL</li>
                  <li>Supplier</li>
                </ul>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductImporter;
