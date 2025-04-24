
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
      console.log("Fetching products with filters:", filters);
      
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
        console.log("Filtering by category:", category);
        countQuery = countQuery.eq('category', category);
        query = query.eq('category', category);
      }

      if (subcategory) {
        console.log("Filtering by subcategory:", subcategory);
        // Check if we should look in name or description for subcategory
        const subcategoryFilter = `%${subcategory}%`;
        countQuery = countQuery.or(`name.ilike.${subcategoryFilter},description.ilike.${subcategoryFilter}`);
        query = query.or(`name.ilike.${subcategoryFilter},description.ilike.${subcategoryFilter}`);
      }

      if (brand) {
        console.log("Filtering by brand/supplier:", brand);
        countQuery = countQuery.eq('supplier', brand);
        query = query.eq('supplier', brand);
      }

      if (priceRange?.min !== undefined) {
        console.log("Filtering by min price:", priceRange.min);
        countQuery = countQuery.gte('price', priceRange.min);
        query = query.gte('price', priceRange.min);
      }

      if (priceRange?.max !== undefined) {
        console.log("Filtering by max price:", priceRange.max);
        countQuery = countQuery.lte('price', priceRange.max);
        query = query.lte('price', priceRange.max);
      }

      if (search) {
        console.log("Searching for:", search);
        const searchTerm = `%${search}%`;
        const searchFilter = `name.ilike.${searchTerm},article_number.ilike.${searchTerm},description.ilike.${searchTerm},supplier.ilike.${searchTerm}`;
        countQuery = countQuery.or(searchFilter);
        query = query.or(searchFilter);
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
          // Fallback to stock_status as a proxy for popularity
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

      console.log("Executing queries...");
      // Execute both queries
      const [countResult, dataResult] = await Promise.all([
        countQuery,
        query
      ]);

      if (countResult.error) {
        console.error("Count query error:", countResult.error);
        throw countResult.error;
      }

      if (dataResult.error) {
        console.error("Data query error:", dataResult.error);
        throw dataResult.error;
      }

      console.log("Query results:", {
        count: countResult.count,
        dataLength: dataResult.data?.length
      });

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
