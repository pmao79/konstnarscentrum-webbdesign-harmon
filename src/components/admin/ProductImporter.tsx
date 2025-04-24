
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImportStatus } from './ImportStatus';
import { ImportFileUpload } from './ImportFileUpload';
import { ImportFormatHelp } from './ImportFormatHelp';
import { useProductImport } from '@/hooks/useProductImport';
import { ColumnMappingType } from '@/types/importing';
import ProductCategorization from './ProductCategorization';

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

  return (
    <div className="grid gap-8">
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
