import { useState, useEffect } from 'react';
import { ProductWithRelations, ProductFilters, AvailableFilters } from '@/types/product';
import { getProducts, getAvailableFilters } from '@/api/products';
import { useToast } from '@/components/ui/use-toast';

// Hook för att hantera produktdata och filter
export function useProducts(filters: ProductFilters = {}) {
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [availableFilters, setAvailableFilters] = useState<AvailableFilters>({
    kategorier: [],
    underkategorier: [],
    varumärken: [],
    produktgrupper: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hämta produkter och filter från API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [productsData, filtersData] = await Promise.all([
          getProducts(filters),
          getAvailableFilters()
        ]);
        setProducts(productsData);
        setAvailableFilters(filtersData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Ett okänt fel uppstod';
        console.error('Fel vid hämtning av data:', err);
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Fel",
          description: "Kunde inte hämta produkter. Försök igen senare."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, toast]);

  return {
    products,
    availableFilters,
    loading,
    error,
    // Hjälpfunktion för att filtrera underkategorier baserat på vald kategori
    getFilteredSubcategories: (kategoriId: string | undefined) => {
      if (!kategoriId) return [];
      return availableFilters.underkategorier.filter(
        uk => uk.kategoriId === kategoriId
      );
    }
  };
}
