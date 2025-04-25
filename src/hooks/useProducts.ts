import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

export interface FilterOptions {
  subcategory?: string;
  brand?: string;
  productGroup?: string;
  search?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  sortBy?: string;
  page?: number;
  limit?: number;
  inStock?: boolean;
}

export const useProducts = (filters: FilterOptions = {}) => {
  const fetchProducts = async () => {
    try {
      // Start with base query
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });
      
      // Apply filters if they exist
      if (filters.subcategory) {
        query = query.eq('variant_type', filters.subcategory);
      }
      
      if (filters.brand) {
        query = query.eq('supplier', filters.brand);
      }
      
      if (filters.productGroup) {
        query = query.eq('variant_name', filters.productGroup);
      }
      
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,article_number.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      
      if (filters.priceRange?.min !== undefined) {
        query = query.gte('price', filters.priceRange.min);
      }
      
      if (filters.priceRange?.max !== undefined) {
        query = query.lte('price', filters.priceRange.max);
      }
      
      if (filters.inStock) {
        query = query.gt('stock_status', 0);
      }
      
      // Apply sorting
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'price-asc':
            query = query.order('price', { ascending: true });
            break;
          case 'price-desc':
            query = query.order('price', { ascending: false });
            break;
          case 'name-asc':
            query = query.order('name', { ascending: true });
            break;
          case 'name-desc':
            query = query.order('name', { ascending: false });
            break;
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          case 'relevans':
          default:
            // For relevance, we don't apply specific sorting
            // If there's search, products matching search will be ranked higher
            query = query.order('name', { ascending: true });
            break;
        }
      } else {
        // Default sorting
        query = query.order('name', { ascending: true });
      }
      
      // Apply pagination
      const page = filters.page || 1;
      const limit = filters.limit || 24;
      const start = (page - 1) * limit;
      const end = start + limit - 1;
      
      query = query.range(start, end);
      
      // Execute the query
      const { data, error, count } = await query;
      
      if (error) {
        console.error("Error fetching products:", error);
        throw error;
      }
      
      return {
        data,
        count: count || 0
      };
    } catch (error) {
      console.error("Error in fetchProducts:", error);
      throw error;
    }
  };

  return useQuery({
    queryKey: ['products', filters],
    queryFn: fetchProducts
  });
};
