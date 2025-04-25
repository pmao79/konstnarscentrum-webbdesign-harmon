
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Check, RefreshCw, Database, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from "sonner";
import { categorizeExistingProducts, syncCategoriesToTable } from '@/services/categorization';

const ProductCategorization = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    processed?: number;
    updated?: number;
    categoriesFound?: number;
    categoriesInserted?: number;
    categories?: string[];
    subcategories?: string[];
    brands?: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCategorizeProducts = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      setProgress(10);
      setResult(null);
      
      toast.info("Kategorisering påbörjad", {
        description: "Produkter kategoriseras baserat på namn, detta kan ta lite tid."
      });
      
      // Start categorization process
      setProgress(30);
      const result = await categorizeExistingProducts();
      
      setProgress(70);
      // Try to sync categories but don't fail if it doesn't work
      let syncResult;
      try {
        syncResult = await syncCategoriesToTable();
      } catch (syncError) {
        console.warn('Category syncing had issues but we can continue:', syncError);
        syncResult = { 
          categoriesFound: result.categories?.length || 0, 
          categoriesInserted: 0 
        };
      }
      
      setProgress(100);
      setResult({
        processed: result.processedCount,
        updated: result.updatedCount,
        categoriesFound: syncResult.categoriesFound,
        categoriesInserted: syncResult.categoriesInserted,
        categories: result.categories,
        subcategories: result.subcategories,
        brands: result.brands
      });
      
      if (result.updatedCount > 0) {
        toast.success("Kategorisering slutförd", {
          description: `${result.updatedCount} produkter har uppdaterats med kategorier.`
        });
      } else {
        toast.info("Kategorisering slutförd", {
          description: "Inga produkter behövde uppdateras. Alla produkter är redan kategoriserade eller matchade inte något mönster."
        });
      }
    } catch (err: any) {
      console.error('Error categorizing products:', err);
      setError(err.message || 'Ett fel uppstod under kategoriseringen');
      
      toast.error("Fel vid kategorisering", {
        description: err.message || 'Ett fel uppstod under kategoriseringen'
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
              <li>Uppdatera endast produkter som saknar kategori eller underkategori</li>
              <li>Befintliga kategorier och klassificeringar bevaras</li>
            </ul>
          </div>
        )}
        
        {isProcessing && (
          <div className="space-y-4">
            <Progress value={progress} className="w-full" />
            <p className="text-center text-sm text-muted-foreground">
              {progress < 30 && "Förbereder kategorisering..."}
              {progress >= 30 && progress < 70 && "Kategoriserar produkter..."}
              {progress >= 70 && progress < 100 && "Sammanställer resultat..."}
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
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-primary/5 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Check className="h-5 w-5 text-green-500" />
                <p className="font-medium">Kategorisering slutförd</p>
              </div>
              <ul className="ml-6 space-y-2 text-sm">
                <li><span className="font-medium">{result.processed}</span> produkter analyserade</li>
                <li><span className="font-medium">{result.updated}</span> produkter uppdaterade</li>
                <li><span className="font-medium">{result.categoriesFound}</span> unika kategorier identifierade</li>
              </ul>
            </div>
            
            {result.updated && result.updated > 0 ? (
              <div className="space-y-4">
                {result.categories && result.categories.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Identifierade kategorier:</h4>
                    <div className="flex flex-wrap gap-1">
                      {result.categories.map(cat => (
                        <span key={cat} className="px-2 py-1 bg-muted text-xs rounded-md">{cat}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {result.subcategories && result.subcategories.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Identifierade underkategorier:</h4>
                    <div className="flex flex-wrap gap-1">
                      {result.subcategories.map(subcat => (
                        <span key={subcat} className="px-2 py-1 bg-muted text-xs rounded-md">{subcat}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {result.brands && result.brands.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Identifierade varumärken:</h4>
                    <div className="flex flex-wrap gap-1">
                      {result.brands.map(brand => (
                        <span key={brand} className="px-2 py-1 bg-muted text-xs rounded-md">{brand}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    För att se alla ändringar och göra manuella justeringar, besök <a href="/admin/classification" className="text-primary underline">Produktklassificering</a>.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Inga produkter behövde uppdateras. Detta kan bero på att alla produkter redan har klassificeringar 
                  eller att produktnamnen inte matchar våra mönster. För manuell klassificering, 
                  besök <a href="/admin/classification" className="text-primary underline">Produktklassificering</a>.
                </AlertDescription>
              </Alert>
            )}
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
