
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';

const ProductImporter = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const processExcelFile = async (file: File) => {
    try {
      setIsLoading(true);
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const products = XLSX.utils.sheet_to_json(firstSheet);

        // Start a transaction to update products
        const { error } = await supabase
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

        if (error) throw error;

        toast({
          title: "Import slutförd",
          description: `${products.length} produkter har importerats/uppdaterats.`,
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
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processExcelFile(file);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-background">
      <h2 className="text-xl font-serif mb-4">Importera produkter</h2>
      <div className="flex items-center gap-4">
        <Button
          disabled={isLoading}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          {isLoading ? 'Importerar...' : 'Välj Excel-fil'}
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
  );
};

export default ProductImporter;
