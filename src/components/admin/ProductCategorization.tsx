
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Check, RefreshCw, Database, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { categorizeExistingProducts, syncCategoriesToTable } from '@/services/importService';

const ProductCategorization = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    processed?: number;
    updated?: number;
    categoriesFound?: number;
    categoriesInserted?: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCategorizeProducts = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      setProgress(10);
      setResult(null);
      
      toast({
        title: "Kategorisering påbörjad",
        description: "Produkter kategoriseras baserat på namn, detta kan ta lite tid.",
      });
      
      // Start categorization process
      setProgress(30);
      const result = await categorizeExistingProducts();
      
      setProgress(70);
      // Sync updated categories to categories table
      const syncResult = await syncCategoriesToTable();
      
      setProgress(100);
      setResult({
        processed: result.processedCount,
        updated: result.updatedCount,
        categoriesFound: syncResult.categoriesFound,
        categoriesInserted: syncResult.categoriesInserted
      });
      
      toast({
        title: "Kategorisering slutförd",
        description: `${result.updatedCount} produkter har uppdaterats med kategorier.`,
      });
    } catch (err: any) {
      console.error('Error categorizing products:', err);
      setError(err.message || 'Ett fel uppstod under kategoriseringen');
      
      toast({
        title: "Fel vid kategorisering",
        description: err.message || 'Ett fel uppstod under kategoriseringen',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-serif">Automatisk kategorisering</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Detta verktyg analyserar produktnamn och tilldelar automatiskt kategorier och varumärken 
          till produkter baserat på mönster i deras namn.
        </p>
        
        {!isProcessing && !result && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 bg-primary/5 rounded-md">
              <Database className="h-5 w-5 text-primary" />
              <p className="text-sm">Verktyget kommer att:</p>
            </div>
            <ul className="ml-6 space-y-2 list-disc text-sm text-muted-foreground">
              <li>Analysera alla produktnamn i databasen</li>
              <li>Tilldela lämpliga kategorier baserat på nyckelord</li>
              <li>Identifiera varumärken från produktnamn</li>
              <li>Synkronisera kategorier till kategorilistan</li>
            </ul>
          </div>
        )}
        
        {isProcessing && (
          <div className="space-y-4">
            <Progress value={progress} className="w-full" />
            <p className="text-center text-sm text-muted-foreground">
              {progress < 30 && "Förbereder kategorisering..."}
              {progress >= 30 && progress < 70 && "Kategoriserar produkter..."}
              {progress >= 70 && progress < 100 && "Sparar kategorier..."}
              {progress === 100 && "Nästan klart..."}
            </p>
          </div>
        )}
        
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {result && (
          <div className="space-y-4 mt-4 p-4 bg-primary/5 rounded-md">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <p className="font-medium">Kategorisering slutförd</p>
            </div>
            <ul className="ml-6 space-y-2 text-sm">
              <li><span className="font-medium">{result.processed}</span> produkter analyserade</li>
              <li><span className="font-medium">{result.updated}</span> produkter uppdaterade</li>
              <li><span className="font-medium">{result.categoriesFound}</span> unika kategorier identifierade</li>
              <li><span className="font-medium">{result.categoriesInserted}</span> kategorier tillagda/uppdaterade i kategorilistan</li>
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleCategorizeProducts} 
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Kategorisera alla produkter
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCategorization;
