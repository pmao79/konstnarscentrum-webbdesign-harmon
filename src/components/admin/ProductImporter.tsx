
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
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

interface ImportProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  validationErrors: Array<{row: number; field: string; message: string}>;
}

// Define column mapping types
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
    supplier: "Varumärke",
    packaging: "Förp",
    unit: "Enhet",
    ean: "EAN",
    code: "Kod",
    misc: "Övrigt"
  },
  english: {
    articleNumber: "Artikelnummer",
    productName: "Produktnamn",
    description: "Beskrivning",
    price: "Pris (SEK)",
    stockStatus: "Lagerstatus",
    imageUrl: "Bild-URL",
    category: "Kategori",
    supplier: "Leverantör"
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

  useEffect(() => {
    // Fetch the most recent successful import
    const getLastImport = async () => {
      const { data, error } = await supabase
        .from('import_logs')
        .select('created_at, products_added')
        .eq('import_status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        setLastSuccessfulImport({
          date: data[0].created_at,
          count: data[0].products_added
        });
      }
    };
    
    getLastImport();
  }, []);

  const validateProducts = (products: any[], mapping: ColumnMapping) => {
    const errors: Array<{row: number; field: string; message: string}> = [];
    
    products.forEach((product, index) => {
      // Check required fields
      if (!product[mapping.articleNumber]) {
        errors.push({row: index + 2, field: mapping.articleNumber, message: 'Artikelnummer måste anges'});
      }
      
      if (!product[mapping.productName]) {
        errors.push({row: index + 2, field: mapping.productName, message: 'Produktnamn måste anges'});
      }
      
      // Validate price is a number
      if (product[mapping.price] && isNaN(parseFloat(product[mapping.price]))) {
        errors.push({row: index + 2, field: mapping.price, message: 'Pris måste vara ett numeriskt värde'});
      }
      
      // Validate stock status is a number if it exists
      const stockStatusField = mapping.stockStatus;
      if (stockStatusField && product[stockStatusField] && isNaN(parseInt(product[stockStatusField]))) {
        errors.push({row: index + 2, field: stockStatusField, message: 'Lagerstatus måste vara ett heltal'});
      }
      
      // Validate image URL format if it exists
      const imageUrlField = mapping.imageUrl;
      if (imageUrlField && product[imageUrlField] && !product[imageUrlField].startsWith('http')) {
        errors.push({row: index + 2, field: imageUrlField, message: 'Bild-URL måste vara en giltig URL'});
      }
    });
    
    return errors;
  };

  const mapProductToDatabase = (product: any, mapping: ColumnMapping) => {
    // Map the product from Excel format to database format
    return {
      article_number: product[mapping.articleNumber],
      name: product[mapping.productName],
      description: mapping.description ? product[mapping.description] : '',
      price: parseFloat(product[mapping.price]) || 0,
      stock_status: mapping.stockStatus && product[mapping.stockStatus] ? parseInt(product[mapping.stockStatus]) : 0,
      image_url: mapping.imageUrl ? product[mapping.imageUrl] : null,
      category: mapping.category ? product[mapping.category] : null,
      supplier: mapping.supplier ? product[mapping.supplier] : 'excel-import',
      // Additional fields mapped as metadata
      metadata: {
        packaging: mapping.packaging ? product[mapping.packaging] : null,
        unit: mapping.unit ? product[mapping.unit] : null,
        ean: mapping.ean ? product[mapping.ean] : null,
        code: mapping.code ? product[mapping.code] : null,
        misc: mapping.misc ? product[mapping.misc] : null
      }
    };
  };

  const processExcelFile = async (file: File) => {
    try {
      setIsLoading(true);
      setUploadProgress(10);
      setImportProgress(null);
      
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          setUploadProgress(30);
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const products = XLSX.utils.sheet_to_json(firstSheet);
          
          setUploadProgress(40);
          
          if (!products || products.length === 0) {
            throw new Error("Inga produkter hittades i filen");
          }
          
          const currentMapping = COLUMN_MAPPINGS[columnMapping];
          
          // Validate products
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
          
          console.log(`Processar ${products.length} produkter från Excel`, products[0]);
          
          setUploadProgress(50);
          
          // Prepare for import log
          const importLog = {
            file_name: file.name,
            supplier: 'excel-import',
            import_status: 'in_progress',
            products_added: 0,
            products_updated: 0
          };
          
          // Create import log entry
          const { data: logData, error: logError } = await supabase
            .from('import_logs')
            .insert(importLog)
            .select()
            .single();
            
          if (logError) throw logError;
          
          setUploadProgress(70);
          
          // Map products to database format
          const mappedProducts = products.map(product => 
            mapProductToDatabase(product, currentMapping)
          );
          
          // Start a transaction to update products
          const { data: importedData, error } = await supabase
            .from('products')
            .upsert(
              mappedProducts.map(product => ({
                article_number: product.article_number,
                name: product.name,
                description: product.description,
                price: product.price,
                stock_status: product.stock_status,
                image_url: product.image_url,
                category: product.category,
                supplier: product.supplier
                // Note: metadata isn't stored directly in the table currently
              })),
              { onConflict: 'article_number' }
            );

          setUploadProgress(90);
            
          if (error) throw error;
          
          // Update import log
          const { error: updateLogError } = await supabase
            .from('import_logs')
            .update({ 
              import_status: 'completed',
              products_added: products.length, // This is simplified - in reality you'd count new vs updated
              products_updated: 0
            })
            .eq('id', logData.id);
            
          if (updateLogError) throw updateLogError;

          // Update last successful import
          setLastSuccessfulImport({
            date: new Date().toISOString(),
            count: products.length
          });

          setUploadProgress(100);
          setSelectedFile(null);
          
          toast({
            title: "Import slutförd",
            description: `${products.length} produkter har importerats/uppdaterats.`,
          });
        } catch (error) {
          console.error('Error processing Excel file:', error);
          toast({
            title: "Bearbetningsfel",
            description: "Ett fel uppstod vid bearbetning av Excel-filen.",
            variant: "destructive",
          });
        }
      };
      
      reader.onerror = () => {
        toast({
          title: "Läsfel",
          description: "Kunde inte läsa Excel-filen.",
          variant: "destructive",
        });
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import misslyckades",
        description: "Ett fel uppstod vid import av produkter.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setUploadProgress(0);
      }, 1000); // Keep progress bar visible briefly
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Reset any previous validation errors
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
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 ease-in-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-right">{uploadProgress}%</p>
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
                  Excelfilens första rad måste innehålla följande kolumner:
                </p>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                  <li>Artikelnummer (obligatorisk)</li>
                  <li>Benämning (obligatorisk)</li>
                  <li>Cirkapris (obligatorisk)</li>
                  <li>Varumärke</li>
                  <li>Förp</li>
                  <li>Enhet</li>
                  <li>EAN</li>
                  <li>Kod</li>
                  <li>Övrigt</li>
                </ul>
              </>
            ) : (
              <>
                <p className="text-muted-foreground mb-2">
                  Excelfilens första rad måste innehålla följande kolumner:
                </p>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                  <li>Artikelnummer (obligatorisk)</li>
                  <li>Produktnamn (obligatorisk)</li>
                  <li>Beskrivning</li>
                  <li>Pris (SEK) (obligatorisk)</li>
                  <li>Lagerstatus</li>
                  <li>Kategori</li>
                  <li>Bild-URL</li>
                  <li>Leverantör</li>
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
