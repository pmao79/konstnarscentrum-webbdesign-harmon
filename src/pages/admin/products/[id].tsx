import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import { useToast } from '../../../components/ui/use-toast';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';

// Interface för produktdata
interface Product {
  id: string;
  huvudnamn: string;
  varumärke: string;
  beskrivning: string | null;
  varianter: {
    artikelnummer: string;
    namn: string;
    pris: number;
    ean: string;
  }[];
  created_at: string;
}

// Interface för formulärdata
interface FormData {
  huvudnamn: string;
  varumärke: string;
  beskrivning: string;
}

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    huvudnamn: '',
    varumärke: '',
    beskrivning: ''
  });

  // Hämta produktdata från Supabase
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        setProduct(data);
        setFormData({
          huvudnamn: data.huvudnamn,
          varumärke: data.varumärke,
          beskrivning: data.beskrivning || ''
        });
      } catch (err) {
        console.error('Fel vid hämtning av produkt:', err);
        setError(err instanceof Error ? err.message : 'Ett okänt fel uppstod');
        toast({
          variant: "destructive",
          title: "Fel",
          description: "Kunde inte hämta produktinformation"
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, toast]);

  // Hantera formulärändringar
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Hantera formulärinlämning
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Kunde inte uppdatera produkt');
      }

      toast({
        title: "Sparat",
        description: "Produktinformationen har uppdaterats"
      });

      // Uppdatera lokal produktdata
      if (product) {
        setProduct({
          ...product,
          ...formData
        });
      }
    } catch (err) {
      console.error('Fel vid uppdatering av produkt:', err);
      toast({
        variant: "destructive",
        title: "Fel",
        description: "Kunde inte spara ändringarna"
      });
    } finally {
      setLoading(false);
    }
  };

  // Visa laddningsindikator
  if (loading && !product) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Visa felmeddelande om produkt inte hittades
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Redigera produkt</h1>
          <p className="text-gray-600">
            Uppdatera produktinformationen nedan och klicka på "Spara ändringar" när du är klar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="huvudnamn">Huvudnamn</Label>
              <Input
                id="huvudnamn"
                name="huvudnamn"
                value={formData.huvudnamn}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="varumärke">Varumärke</Label>
              <Input
                id="varumärke"
                name="varumärke"
                value={formData.varumärke}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="beskrivning">Beskrivning</Label>
              <Textarea
                id="beskrivning"
                name="beskrivning"
                value={formData.beskrivning}
                onChange={handleChange}
                className="mt-1"
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/products')}
            >
              Avbryt
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Sparar...' : 'Spara ändringar'}
            </Button>
          </div>
        </form>

        {/* Visa produktvariationer */}
        {product?.varianter && product.varianter.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4">Produktvariationer</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Artikelnummer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Namn
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pris
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      EAN
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {product.varianter.map((variant) => (
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
                        {variant.ean}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 