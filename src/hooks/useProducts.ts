
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type FilterOptions = {
  category?: string;
  subcategory?: string;
  brand?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  search?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
};

export const useProducts = (filters: FilterOptions = {}) => {
  const { 
    category, 
    subcategory, 
    brand, 
    priceRange, 
    search, 
    sortBy = 'relevans',
    page = 1,
    limit = 24
  } = filters;

  // Calculate offset for pagination
  const offset = (page - 1) * limit;

  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      // First query to get the total count
      let countQuery = supabase
        .from('products')
        .select('id', { count: 'exact', head: true });

      // Main query to get the products with filtering
      let query = supabase
        .from('products')
        .select(`
          *,
          master_product:master_product_id(*)
        `);

      // Apply filters to both queries
      if (category) {
        countQuery = countQuery.eq('category', category);
        query = query.eq('category', category);
      }

      if (subcategory) {
        // Assuming subcategory is stored somehow, adjust as needed
        countQuery = countQuery.ilike('description', `%${subcategory}%`);
        query = query.ilike('description', `%${subcategory}%`);
      }

      if (brand) {
        countQuery = countQuery.eq('supplier', brand);
        query = query.eq('supplier', brand);
      }

      if (priceRange?.min !== undefined) {
        countQuery = countQuery.gte('price', priceRange.min);
        query = query.gte('price', priceRange.min);
      }

      if (priceRange?.max !== undefined) {
        countQuery = countQuery.lte('price', priceRange.max);
        query = query.lte('price', priceRange.max);
      }

      if (search) {
        const searchTerm = `%${search}%`;
        countQuery = countQuery.or(
          `name.ilike.${searchTerm},article_number.ilike.${searchTerm},description.ilike.${searchTerm}`
        );
        query = query.or(
          `name.ilike.${searchTerm},article_number.ilike.${searchTerm},description.ilike.${searchTerm}`
        );
      }

      // Apply sorting
      switch (sortBy) {
        case 'lagstPris':
          query = query.order('price', { ascending: true });
          break;
        case 'hogstPris':
          query = query.order('price', { ascending: false });
          break;
        case 'nyast':
          query = query.order('created_at', { ascending: false });
          break;
        case 'popularitet':
          // Assuming there's a popularity or sales_count field, adjust as needed
          query = query.order('stock_status', { ascending: false });
          break;
        case 'namn_asc':
          query = query.order('name', { ascending: true });
          break;
        case 'namn_desc':
          query = query.order('name', { ascending: false });
          break;
        case 'relevans':
        default:
          // Default sorting logic
          if (search) {
            // If searching, relevance is determined by exact matches first
            query = query.order('name', { ascending: true });
          } else {
            query = query.order('created_at', { ascending: false });
          }
          break;
      }

      // Apply pagination to the main query only
      query = query.range(offset, offset + limit - 1);

      // Execute both queries
      const [countResult, dataResult] = await Promise.all([
        countQuery,
        query
      ]);

      if (countResult.error) {
        throw countResult.error;
      }

      if (dataResult.error) {
        throw dataResult.error;
      }

      return {
        data: dataResult.data,
        count: countResult.count || 0,
        page,
        limit,
        totalPages: Math.ceil((countResult.count || 0) / limit)
      };
    }
  });
};
