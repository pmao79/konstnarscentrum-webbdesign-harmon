import { useEffect, useState } from 'react';
import { useToast } from '../../../components/ui/use-toast';
import { Button } from '../../../components/ui/button';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';

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
  kategori: string;
  underkategori: string;
  varumärke: string;
  produktgrupp: string;
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
            kategori: product.kategori || '',
            underkategori: product.underkategori || '',
            varumärke: product.varumärke || '',
            produktgrupp: product.produktgrupp || ''
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
        ...(field === 'kategori' ? { underkategori: '' } : {})
      }
    }));
  };

  // Spara klassificering för en produkt
  const handleSaveClassification = async (productId: string) => {
    const classification = classifications[productId];
    
    // Validera att alla fält är ifyllda
    if (!classification.kategori || !classification.underkategori || 
        !classification.varumärke || !classification.produktgrupp) {
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

  // Kontrollera om en produkt saknar klassificering
  const isMissingClassification = (product: UnclassifiedProduct) => {
    return !product.kategori || !product.underkategori || 
           !product.varumärke || !product.produktgrupp;
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
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Artikelnummer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produktnamn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Underkategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Varumärke
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produktgrupp
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Åtgärder
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {product.artikelnummer}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {product.namn}
                      </div>
                      {isMissingClassification(product) && (
                        <Badge variant="destructive" className="mt-1">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Saknar klassificering
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={classifications[product.id]?.kategori || ''}
                        onChange={(e) => handleClassificationChange(product.id, 'kategori', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Välj kategori</option>
                        {availableFilters.kategorier.map(kategori => (
                          <option key={kategori} value={kategori}>{kategori}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={classifications[product.id]?.underkategori || ''}
                        onChange={(e) => handleClassificationChange(product.id, 'underkategori', e.target.value)}
                        disabled={!classifications[product.id]?.kategori}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      >
                        <option value="">Välj underkategori</option>
                        {getFilteredSubcategories(classifications[product.id]?.kategori || '').map(underkategori => (
                          <option key={underkategori} value={underkategori}>{underkategori}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={classifications[product.id]?.varumärke || ''}
                        onChange={(e) => handleClassificationChange(product.id, 'varumärke', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Välj varumärke</option>
                        {availableFilters.varumärken.map(varumärke => (
                          <option key={varumärke} value={varumärke}>{varumärke}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={classifications[product.id]?.produktgrupp || ''}
                        onChange={(e) => handleClassificationChange(product.id, 'produktgrupp', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Välj produktgrupp</option>
                        {availableFilters.produktgrupper.map(grupp => (
                          <option key={grupp} value={grupp}>{grupp}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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