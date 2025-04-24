
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type FilterOptions = {
  category?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  search?: string;
};

export const useProducts = (filters: FilterOptions = {}) => {
  const { category, priceRange, search } = filters;

  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*');

      if (category) {
        query = query.eq('category', category);
      }

      if (priceRange?.min !== undefined) {
        query = query.gte('price', priceRange.min);
      }

      if (priceRange?.max !== undefined) {
        query = query.lte('price', priceRange.max);
      }

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data;
    }
  });
};
