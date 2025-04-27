import { useState } from 'react';
import { useToast } from '../../../components/ui/use-toast';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';

// Interface för produktvariant
interface ProductVariant {
  artikelnummer: string;
  namn: string;
  pris: number;
  ean: string;
}

// Interface för produkt
interface Product {
  id: string;
  huvudnamn: string;
  varianter: ProductVariant[];
}

export default function UpdatePrices() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [newPrice, setNewPrice] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

  // Hämta produkter baserat på sökterm
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        variant: "destructive",
        title: "Fel",
        description: "Ange ett huvudnamn att söka efter"
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/products?huvudnamn=${encodeURIComponent(searchTerm)}`);
      
      if (!response.ok) {
        throw new Error('Kunde inte hämta produkter');
      }

      const data = await response.json();
      setProducts(data);
      
      if (data.length === 0) {
        toast({
          variant: "destructive",
          title: "Inga produkter hittades",
          description: "Kontrollera stavningen och försök igen"
        });
      }
    } catch (err) {
      console.error('Fel vid hämtning av produkter:', err);
      toast({
        variant: "destructive",
        title: "Fel",
        description: "Kunde inte hämta produkter"
      });
    } finally {
      setLoading(false);
    }
  };

  // Öppna bekräftelsedialog
  const handleOpenConfirmDialog = () => {
    if (!searchTerm.trim() || !newPrice.trim()) {
      toast({
        variant: "destructive",
        title: "Fel",
        description: "Fyll i både huvudnamn och nytt pris"
      });
      return;
    }

    const price = parseFloat(newPrice);
    if (isNaN(price) || price <= 0) {
      toast({
        variant: "destructive",
        title: "Fel",
        description: "Ange ett giltigt pris (större än 0)"
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  // Uppdatera priser för alla varianter
  const handleUpdatePrices = async () => {
    setShowConfirmDialog(false);
    
    try {
      setUpdating(true);
      const response = await fetch('/api/admin/products/update-prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          huvudnamn: searchTerm,
          nyttPris: parseFloat(newPrice)
        }),
      });

      if (!response.ok) {
        throw new Error('Kunde inte uppdatera priser');
      }

      // Uppdatera lokala priser
      setProducts(prevProducts => 
        prevProducts.map(product => ({
          ...product,
          varianter: product.varianter.map(variant => ({
            ...variant,
            pris: parseFloat(newPrice)
          }))
        }))
      );

      toast({
        title: "Sparat",
        description: "Priserna har uppdaterats"
      });
    } catch (err) {
      console.error('Fel vid uppdatering av priser:', err);
      toast({
        variant: "destructive",
        title: "Fel",
        description: "Kunde inte uppdatera priser"
      });
    } finally {
      setUpdating(false);
    }
  };

  // Beräkna totalt antal varianter
  const totalVariants = products.reduce((acc, curr) => acc + curr.varianter.length, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Uppdatera produktpriser</h1>
          <p className="text-gray-600">
            Sök efter produkter med huvudnamn och uppdatera priser för alla varianter på en gång.
          </p>
        </div>

        {/* Sökformulär */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search">Huvudnamn</Label>
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="T.ex. Barnfärg Temperapuck 57x19mm"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="newPrice">Nytt pris (kr)</Label>
              <Input
                id="newPrice"
                type="number"
                min="0"
                step="0.01"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="T.ex. 59"
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <Button
              onClick={handleSearch}
              disabled={loading || !searchTerm.trim()}
            >
              {loading ? 'Hämtar...' : 'Hämta produkter'}
            </Button>
            {products.length > 0 && (
              <Button
                onClick={handleOpenConfirmDialog}
                disabled={updating || !newPrice.trim()}
              >
                {updating ? 'Sparar...' : 'Spara nya priser'}
              </Button>
            )}
          </div>
        </div>

        {/* Produktlista */}
        {products.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">
                Hittade {products.length} produkt{products.length !== 1 ? 'er' : ''} med {totalVariants} varianter
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Artikelnummer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Färg
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nuvarande pris
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nytt pris
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.flatMap(product => 
                    product.varianter.map(variant => (
                      <tr key={variant.artikelnummer} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {variant.artikelnummer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {variant.namn}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {variant.pris} kr
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {newPrice ? `${newPrice} kr` : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bekräftelsedialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bekräfta prisuppdatering</DialogTitle>
              <DialogDescription>
                Du är på väg att uppdatera priset för {totalVariants} varianter av {products.length} produkt{products.length !== 1 ? 'er' : ''} till {newPrice} kr.
                Är du säker på att du vill fortsätta?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
              >
                Avbryt
              </Button>
              <Button
                onClick={handleUpdatePrices}
                disabled={updating}
              >
                {updating ? 'Sparar...' : 'Ja, uppdatera priser'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 