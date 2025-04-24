
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { Loader2 } from "lucide-react";

const ProductImporter = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const processExcelFile = async (file: File) => {
    try {
      setIsLoading(true);
      setUploadProgress(10);
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          setUploadProgress(30);
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const products = XLSX.utils.sheet_to_json(firstSheet);
          
          setUploadProgress(50);
          
          if (!products || products.length === 0) {
            throw new Error("Inga produkter hittades i filen");
          }
          
          console.log(`Processar ${products.length} produkter från Excel`, products[0]);
          
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
          
          // Start a transaction to update products
          const { data: importedData, error } = await supabase
            .from('products')
            .upsert(
              products.map((product: any) => ({
                article_number: product['Artikelnummer'],
                name: product['Produktnamn'],
                description: product['Beskrivning'],
                price: parseFloat(product['Pris (SEK)']),
                stock_status: parseInt(product['Lagerstatus']),
                image_url: product['Bild-URL'],
                category: product['Kategori'],
                supplier: 'excel-import' // Default supplier tag
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
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-background">
      <h2 className="text-xl font-serif mb-4">Importera produkter</h2>
      <div className="flex flex-col gap-4">
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
      </div>
    </div>
  );
};

export default ProductImporter;
