import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ImportStatus } from './ImportStatus';
import { ImportFileUpload } from './ImportFileUpload';
import { ImportFormatHelp } from './ImportFormatHelp';
import { useProductImport } from '@/hooks/useProductImport';
import { ColumnMappingType } from '@/types/importing';
import ProductCategorization from './ProductCategorization';
import { cleanExcelImportedProducts } from '@/services/importService';

const ProductImporter = () => {
  const {
    isLoading,
    uploadProgress,
    selectedFile,
    setSelectedFile,
    importProgress,
    errorMessage,
    handleImport
  } = useProductImport();
  
  const [columnMapping, setColumnMapping] = useState<keyof ColumnMappingType>("swedish");
  const [lastSuccessfulImport, setLastSuccessfulImport] = useState<{date: string, count: number} | null>(null);
  const [isCleaningProducts, setIsCleaningProducts] = useState(false);
  const { toast } = useToast();

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

  const handleFileUpload = (file: File) => {
    setSelectedFile(file);
  };

  const handleStartImport = () => {
    if (selectedFile) {
      handleImport(selectedFile, columnMapping);
    }
  };

  const handleCleanExcelProducts = async () => {
    setIsCleaningProducts(true);
    const result = await cleanExcelImportedProducts();
    
    if (result.success) {
      toast({
        title: "Produktrensning slutförd",
        description: "Alla Excel-importerade produkter har raderats.",
        variant: "default"
      });
    } else {
      toast({
        title: "Fel vid produktrensning",
        description: result.message,
        variant: "destructive"
      });
    }
    setIsCleaningProducts(false);
  };

  return (
    <div className="grid gap-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-serif">Importera produkter</CardTitle>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Rensa Excel-produkter
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Rensa Excel-importerade produkter?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Detta kommer att radera alla tidigare importerade produkter från Excel. 
                    API-kopplade produkter påverkas inte. Vill du fortsätta?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Avbryt</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleCleanExcelProducts} 
                    disabled={isCleaningProducts}
                  >
                    {isCleaningProducts ? 'Rensar...' : 'Rensa produkter'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="grid gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="column-format">Välj kolumnformat</Label>
                <Select 
                  value={columnMapping} 
                  onValueChange={(value) => setColumnMapping(value as keyof ColumnMappingType)}
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
              
              <ImportFileUpload
                isLoading={isLoading}
                selectedFile={selectedFile}
                lastSuccessfulImport={lastSuccessfulImport}
                onFileSelect={handleFileUpload}
                onImport={handleStartImport}
              />
            </div>
            
            <ImportStatus 
              isLoading={isLoading}
              uploadProgress={uploadProgress}
              importProgress={importProgress}
              errorMessage={errorMessage}
            />
            
            <ImportFormatHelp columnMapping={columnMapping} />
          </div>
        </CardContent>
      </Card>
      
      <ProductCategorization />
    </div>
  );
};

export default ProductImporter;
