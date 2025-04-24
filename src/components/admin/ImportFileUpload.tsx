
import React from 'react';
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';

interface ImportFileUploadProps {
  isLoading: boolean;
  selectedFile: File | null;
  lastSuccessfulImport: { date: string; count: number } | null;
  onFileSelect: (file: File) => void;
  onImport: () => void;
}

export const ImportFileUpload: React.FC<ImportFileUploadProps> = ({
  isLoading,
  selectedFile,
  lastSuccessfulImport,
  onFileSelect,
  onImport
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
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
          onChange={handleFileChange}
        />
        <p className="text-sm text-muted-foreground">
          Stödjer Excel-filer (.xlsx, .xls)
        </p>
      </div>
      
      {lastSuccessfulImport && !isLoading && !selectedFile && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4 text-green-500" />
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
            onClick={onImport}
            disabled={isLoading}
          >
            Importera nu
          </Button>
        </div>
      )}
    </div>
  );
};
