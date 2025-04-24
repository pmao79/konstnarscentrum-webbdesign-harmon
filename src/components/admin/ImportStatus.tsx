
import React from 'react';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Loader2 } from "lucide-react";
import { ImportProgress } from '@/types/importing';

interface ImportStatusProps {
  isLoading: boolean;
  uploadProgress: number;
  importProgress: ImportProgress | null;
  errorMessage: string | null;
}

export const ImportStatus: React.FC<ImportStatusProps> = ({
  isLoading,
  uploadProgress,
  importProgress,
  errorMessage
}) => {
  if (!isLoading && !importProgress && !errorMessage) return null;

  return (
    <div className="space-y-4">
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
        <div className="border rounded-md p-4 bg-destructive/10">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h3 className="font-medium">Felmeddelande</h3>
          </div>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
        </div>
      )}
      
      {importProgress && importProgress.validationErrors.length > 0 && (
        <div className="border rounded-md p-4 bg-destructive/10">
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
    </div>
  );
};
