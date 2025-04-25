
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

export const useProductsAdmin = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedProductGroup, setSelectedProductGroup] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [productGroups, setProductGroups] = useState<string[]>([]);
  const [groupedView, setGroupedView] = useState(true);

  const fetchProducts = useCallback(async () => {
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
      
      const allProducts = [
        ...(standaloneProducts || []),
        ...masterProducts?.flatMap(mp => mp.products) || []
      ];
      
      setProducts(allProducts);
      setFilteredProducts(allProducts);

      // Extract unique values for filters - use the correct field mappings
      const uniqueCategories = Array.from(new Set(
        allProducts.map(product => product.category || 'Okategoriserad')
          .filter(Boolean)
      )).sort();
      
      // underkategori = variant_type
      const uniqueSubcategories = Array.from(new Set(
        allProducts.map(product => product.variant_type || 'Övrigt')
          .filter(Boolean)
      )).sort();
      
      // varumarke = supplier
      const uniqueBrands = Array.from(new Set(
        allProducts.map(product => product.supplier || 'Okänd')
          .filter(Boolean)
      )).sort();

      // produktgrupp = variant_name
      const uniqueProductGroups = Array.from(new Set(
        allProducts.map(product => product.variant_name || 'Övrigt')
          .filter(Boolean)
      )).sort();
      
      setCategories(uniqueCategories);
      setSubcategories(uniqueSubcategories);
      setBrands(uniqueBrands);
      setProductGroups(uniqueProductGroups);
      
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
    
    // Filter by underkategori (variant_type)
    if (selectedSubcategory && selectedSubcategory !== 'all') {
      result = result.filter(product => 
        product.variant_type === selectedSubcategory
      );
    }
    
    // Filter by varumarke (supplier)
    if (selectedBrand && selectedBrand !== 'all') {
      result = result.filter(product => 
        product.supplier === selectedBrand
      );
    }

    // Filter by produktgrupp (variant_name)
    if (selectedProductGroup && selectedProductGroup !== 'all') {
      result = result.filter(product => 
        product.variant_name === selectedProductGroup
      );
    }

    // Filter by in stock (förp > 0, implemented as stock_status in the database)
    if (inStockOnly) {
      result = result.filter(product => 
        product.stock_status > 0
      );
    }
    
    setFilteredProducts(result);
  }, [
    products, 
    search, 
    selectedCategory, 
    selectedSubcategory,
    selectedBrand,
    selectedProductGroup,
    inStockOnly
  ]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setSelectedBrand('all');
    setSelectedProductGroup('all');
    setInStockOnly(false);
  };

  const refreshProducts = () => {
    fetchProducts();
  };

  return {
    products,
    filteredProducts,
    isLoading,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    selectedSubcategory,
    setSelectedSubcategory,
    selectedBrand,
    setSelectedBrand,
    selectedProductGroup,
    setSelectedProductGroup,
    inStockOnly,
    setInStockOnly,
    categories,
    subcategories,
    brands,
    productGroups,
    groupedView,
    setGroupedView,
    resetFilters,
    refreshProducts
  };
};
