
import { useState } from 'react';
import type { ImportProgress } from '@/types/importing';

export const useImportProgress = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return {
    isLoading,
    setIsLoading,
    uploadProgress,
    setUploadProgress,
    selectedFile,
    setSelectedFile,
    importProgress,
    setImportProgress,
    errorMessage,
    setErrorMessage,
  };
};
