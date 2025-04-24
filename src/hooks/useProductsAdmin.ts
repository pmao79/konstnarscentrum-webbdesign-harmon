
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

export const useProductsAdmin = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [groupedView, setGroupedView] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        let { data: masterProducts, error: masterError } = await supabase
          .from('master_products')
          .select(`
            *,
            products:products(*)
          `)
          .order('name', { ascending: true });
        
        if (masterError) throw masterError;
        
        const { data: standaloneProducts, error: productsError } = await supabase
          .from('products')
          .select('*')
          .is('master_product_id', null)
          .order('name', { ascending: true });
          
        if (productsError) throw productsError;
        
        setProducts(standaloneProducts || []);
        setFilteredProducts(standaloneProducts || []);
        
        const allProducts = [
          ...(standaloneProducts || []),
          ...masterProducts?.flatMap(mp => mp.products) || []
        ];
        
        const uniqueCategories = Array.from(new Set(
          allProducts.map(product => product.category || 'Okategoriserad')
            .filter(Boolean)
        )).sort();
        
        const uniqueSuppliers = Array.from(new Set(
          allProducts.map(product => product.supplier || 'Okänd')
            .filter(Boolean)
        )).sort();
        
        setCategories(uniqueCategories as string[]);
        setSuppliers(uniqueSuppliers as string[]);
        
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = [...products];
    
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchLower) || 
        product.article_number.toLowerCase().includes(searchLower) ||
        (product.description || '').toLowerCase().includes(searchLower)
      );
    }
    
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(product => 
        product.category === selectedCategory
      );
    }
    
    if (selectedSupplier && selectedSupplier !== 'all') {
      result = result.filter(product => 
        product.supplier === selectedSupplier
      );
    }
    
    result.sort((a, b) => {
      let comparison = 0;
      
      switch(sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'article_number':
          comparison = a.article_number.localeCompare(b.article_number);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'stock':
          comparison = a.stock_status - b.stock_status;
          break;
        case 'category':
          comparison = (a.category || '').localeCompare(b.category || '');
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredProducts(result);
  }, [products, search, sortBy, sortDirection, selectedCategory, selectedSupplier]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedSupplier('all');
    setSortBy('name');
    setSortDirection('asc');
  };

  return {
    products,
    filteredProducts,
    isLoading,
    search,
    setSearch,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    categories,
    selectedCategory,
    setSelectedCategory,
    suppliers,
    selectedSupplier,
    setSelectedSupplier,
    groupedView,
    setGroupedView,
    resetFilters
  };
};
