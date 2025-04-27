import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useToast } from '../../components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ScrollArea } from '../../components/ui/scroll-area';

interface Product {
  id: string;
  namn: string;
  beskrivning: string;
  bild: string | null;
  kategoriid: string | null;
  underkategoriid: string | null;
}

interface Kategori {
  id: string;
  namn: string;
}

interface Underkategori {
  id: string;
  namn: string;
  kategoriid: string;
}

export default function ClassifyProducts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [kategorier, setKategorier] = useState<Kategori[]>([]);
  const [underkategorier, setUnderkategorier] = useState<Underkategori[]>([]);
  const [selectedKategori, setSelectedKategori] = useState<Record<string, string>>({});
  const [selectedUnderkategori, setSelectedUnderkategori] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Hämta kategorier och underkategorier
        const [
          { data: kategorierData },
          { data: underkategorierData }
        ] = await Promise.all([
          supabase.from('kategorier').select('id, namn'),
          supabase.from('underkategorier').select('id, namn, kategoriid')
        ]);

        if (kategorierData) setKategorier(kategorierData);
        if (underkategorierData) setUnderkategorier(underkategorierData);

        // Hämta produkter utan kategori eller med kategori 'Övrigt'
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .or('kategoriid.is.null,kategoriid.eq.övrigt')
          .order('namn');

        if (productsData) {
          setProducts(productsData);
          // Initiera valda kategorier och underkategorier
          const initialKategori: Record<string, string> = {};
          const initialUnderkategori: Record<string, string> = {};
          productsData.forEach(product => {
            if (product.kategoriid) initialKategori[product.id] = product.kategoriid;
            if (product.underkategoriid) initialUnderkategori[product.id] = product.underkategoriid;
          });
          setSelectedKategori(initialKategori);
          setSelectedUnderkategori(initialUnderkategori);
        }
      } catch (error) {
        console.error('Fel vid hämtning av data:', error);
        toast({
          title: 'Ett fel uppstod',
          description: 'Kunde inte hämta data från databasen',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  const handleKategoriChange = (productId: string, value: string) => {
    setSelectedKategori(prev => ({ ...prev, [productId]: value }));
    // Rensa vald underkategori när kategori ändras
    setSelectedUnderkategori(prev => ({ ...prev, [productId]: '' }));
  };

  const handleUnderkategoriChange = (productId: string, value: string) => {
    setSelectedUnderkategori(prev => ({ ...prev, [productId]: value }));
  };

  const handleSave = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          kategoriid: selectedKategori[productId] || null,
          underkategoriid: selectedUnderkategori[productId] || null
        })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: 'Sparat',
        description: 'Produktens kategori har uppdaterats',
      });

      // Uppdatera produkter efter sparning
      const { data: updatedProduct } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (updatedProduct) {
        setProducts(prev => 
          prev.map(p => p.id === productId ? updatedProduct : p)
        );
      }
    } catch (error) {
      console.error('Fel vid uppdatering:', error);
      toast({
        title: 'Ett fel uppstod',
        description: 'Kunde inte spara ändringarna',
        variant: 'destructive'
      });
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Åtkomst nekad</h1>
        <p>Du måste vara inloggad för att se denna sida.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Laddar...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Klassificera produkter</h1>
      
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-4">
          {products.map(product => (
            <Card key={product.id}>
              <CardHeader>
                <CardTitle>{product.namn}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      {product.beskrivning}
                    </p>
                    {product.bild && (
                      <img 
                        src={product.bild} 
                        alt={product.namn}
                        className="w-32 h-32 object-cover rounded"
                      />
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Kategori
                      </label>
                      <Select
                        value={selectedKategori[product.id] || ''}
                        onValueChange={(value) => handleKategoriChange(product.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Välj kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {kategorier.map(kategori => (
                            <SelectItem key={kategori.id} value={kategori.id}>
                              {kategori.namn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Underkategori
                      </label>
                      <Select
                        value={selectedUnderkategori[product.id] || ''}
                        onValueChange={(value) => handleUnderkategoriChange(product.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Välj underkategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {underkategorier
                            .filter(uk => uk.kategoriid === selectedKategori[product.id])
                            .map(underkategori => (
                              <SelectItem key={underkategori.id} value={underkategori.id}>
                                {underkategori.namn}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={() => handleSave(product.id)}
                      disabled={!selectedKategori[product.id]}
                    >
                      Spara
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
} 