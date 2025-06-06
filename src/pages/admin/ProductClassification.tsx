import { useEffect, useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

// Interface för oklassificerad produkt
interface UnclassifiedProduct {
  id: string;
  artikelnummer: string;
  namn: string;
  kategori: string | null;
  underkategori: string | null;
  varumärke: string | null;
  produktgrupp: string | null;
}

// Interface för filter
interface Filter {
  kategori: string;
  underkategori: string;
  varumärke: string;
  produktgrupp: string;
}

// Interface för tillgängliga filter
interface AvailableFilters {
  kategorier: string[];
  underkategorier: string[];
  varumärken: string[];
  produktgrupper: string[];
}

// Interface för klassificeringsdata
interface ClassificationData {
  kategoriId: string;
  underkategoriId: string;
  varumarkeId: string;
  produktgruppId: string;
}

export default function ProductClassification() {
  const { toast } = useToast();
  const [products, setProducts] = useState<UnclassifiedProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<{ [key: string]: boolean }>({});
  const [availableFilters, setAvailableFilters] = useState<AvailableFilters>({
    kategorier: [],
    underkategorier: [],
    varumärken: [],
    produktgrupper: []
  });
  const [classifications, setClassifications] = useState<{ [key: string]: ClassificationData }>({});

  // Hämta oklassificerade produkter och filter
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsResponse, filtersResponse] = await Promise.all([
          fetch('/api/admin/products/unclassified'),
          fetch('/api/admin/products/filters')
        ]);

        if (!productsResponse.ok || !filtersResponse.ok) {
          throw new Error('Kunde inte hämta data');
        }

        const productsData = await productsResponse.json();
        const filtersData = await filtersResponse.json();

        setProducts(productsData);
        setAvailableFilters(filtersData);
        
        // Initiera klassificeringar med befintliga värden
        const initialClassifications = productsData.reduce((acc: { [key: string]: ClassificationData }, product) => {
          acc[product.id] = {
            kategoriId: product.kategori || '',
            underkategoriId: product.underkategori || '',
            varumarkeId: product.varumärke || '',
            produktgruppId: product.produktgrupp || ''
          };
          return acc;
        }, {});

        setClassifications(initialClassifications);
      } catch (err) {
        console.error('Fel vid hämtning av data:', err);
        toast({
          variant: "destructive",
          title: "Fel",
          description: "Kunde inte hämta produktdata"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Hantera ändring av klassificering
  const handleClassificationChange = (productId: string, field: keyof ClassificationData, value: string) => {
    setClassifications(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
        // Nollställ underkategori om kategori ändras
        ...(field === 'kategoriId' ? { underkategoriId: '' } : {})
      }
    }));
  };

  // Spara klassificering för en produkt
  const handleSaveClassification = async (productId: string) => {
    const classification = classifications[productId];
    
    // Validera att alla fält är ifyllda
    if (!classification.kategoriId || !classification.underkategoriId || 
        !classification.varumarkeId || !classification.produktgruppId) {
      toast({
        variant: "destructive",
        title: "Fel",
        description: "Alla fält måste vara ifyllda"
      });
      return;
    }

    try {
      setSaving(prev => ({ ...prev, [productId]: true }));
      
      const response = await fetch(`/api/admin/products/${productId}/classify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(classification)
      });

      if (!response.ok) {
        throw new Error('Kunde inte spara klassificering');
      }

      // Uppdatera produktlistan
      setProducts(prevProducts => 
        prevProducts.filter(p => p.id !== productId)
      );

      toast({
        title: "Sparad",
        description: "Klassificeringen har sparats"
      });
    } catch (err) {
      console.error('Fel vid sparande av klassificering:', err);
      toast({
        variant: "destructive",
        title: "Fel",
        description: "Kunde inte spara klassificeringen"
      });
    } finally {
      setSaving(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Filtrera underkategorier baserat på vald kategori
  const getFilteredSubcategories = (kategori: string) => {
    return availableFilters.underkategorier.filter(uk => 
      !kategori || uk.startsWith(kategori)
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Produktklassificering</h1>
        <p className="text-gray-600">
          Klassificera produkter som saknar kategori, underkategori, varumärke eller produktgrupp.
        </p>
      </div>

      {/* Laddningsindikator */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      )}

      {/* Produkttabell */}
      {!loading && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artikelnummer</TableHead>
                  <TableHead>Produktnamn</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Underkategori</TableHead>
                  <TableHead>Varumärke</TableHead>
                  <TableHead>Produktgrupp</TableHead>
                  <TableHead className="text-right">Åtgärder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.artikelnummer}</TableCell>
                    <TableCell>{product.namn}</TableCell>
                    <TableCell>
                      <Select
                        value={classifications[product.id]?.kategoriId || ''}
                        onValueChange={(value) => handleClassificationChange(product.id, 'kategoriId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Välj kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFilters.kategorier.map(kategori => (
                            <SelectItem key={kategori} value={kategori}>{kategori}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={classifications[product.id]?.underkategoriId || ''}
                        onValueChange={(value) => handleClassificationChange(product.id, 'underkategoriId', value)}
                        disabled={!classifications[product.id]?.kategoriId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Välj underkategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {getFilteredSubcategories(classifications[product.id]?.kategoriId || '').map(underkategori => (
                            <SelectItem key={underkategori} value={underkategori}>{underkategori}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={classifications[product.id]?.varumarkeId || ''}
                        onValueChange={(value) => handleClassificationChange(product.id, 'varumarkeId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Välj varumärke" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFilters.varumärken.map(varumärke => (
                            <SelectItem key={varumärke} value={varumärke}>{varumärke}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={classifications[product.id]?.produktgruppId || ''}
                        onValueChange={(value) => handleClassificationChange(product.id, 'produktgruppId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Välj produktgrupp" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFilters.produktgrupper.map(grupp => (
                            <SelectItem key={grupp} value={grupp}>{grupp}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => handleSaveClassification(product.id)}
                        disabled={saving[product.id]}
                        className="flex items-center space-x-2"
                      >
                        {saving[product.id] ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Sparar...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Spara</span>
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Ingen data */}
      {!loading && products.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Inga oklassificerade produkter</h3>
          <p className="mt-1 text-sm text-gray-500">
            Alla produkter har fullständig klassificering.
          </p>
        </div>
      )}
    </div>
  );
}
