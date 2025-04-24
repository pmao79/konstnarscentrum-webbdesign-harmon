
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProductFilters from '@/components/ProductFilters';
import ProductsHero from '@/components/shop/ProductsHero';
import ProductSearch from '@/components/shop/ProductSearch';
import ProductSort from '@/components/shop/ProductSort';
import ProductGrid from '@/components/shop/ProductGrid';
import { useProducts, FilterOptions } from '@/hooks/useProducts';
import { useToast } from "@/hooks/use-toast";

// Based on existing product categories in the database
const categories = [
  { name: "Färg", subcategories: ["Akvarell", "Akryl", "Olja", "Gouache"] },
  { name: "Penslar", subcategories: ["Akvarellpenslar", "Akrylpenslar", "Oljepenslar"] },
  { name: "Papper", subcategories: ["Akvarellpapper", "Skissblock", "Canvas"] },
  { name: "Stafflier", subcategories: ["Bordsställ", "Golvstaffli", "Fältstaffli"] },
  { name: "Winsor & Newton", subcategories: ["Färger", "Penslar", "Tillbehör"] },
];

const Products = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize state from URL parameters
  const [filters, setFilters] = useState<FilterOptions>({
    category: searchParams.get('category') || undefined,
    subcategory: searchParams.get('subcategory') || undefined,
    brand: searchParams.get('brand') || undefined,
    search: searchParams.get('search') || '',
    priceRange: {
      min: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      max: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    },
    sortBy: searchParams.get('sort') || 'relevans',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 24,
  });
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { data: productData, isLoading, error } = useProducts(filters);

  // Display data in console for debugging
  useEffect(() => {
    if (productData) {
      console.log("Product data fetched:", { 
        count: productData.count, 
        dataLength: productData.data?.length,
        filters
      });
    }
    if (error) {
      console.error("Error fetching products:", error);
    }
  }, [productData, error, filters]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.category) params.set('category', filters.category);
    if (filters.subcategory) params.set('subcategory', filters.subcategory);
    if (filters.brand) params.set('brand', filters.brand);
    if (filters.search) params.set('search', filters.search);
    if (filters.priceRange?.min) params.set('minPrice', filters.priceRange.min.toString());
    if (filters.priceRange?.max) params.set('maxPrice', filters.priceRange.max.toString());
    if (filters.sortBy) params.set('sort', filters.sortBy);
    if (filters.page && filters.page > 1) params.set('page', filters.page.toString());
    if (filters.limit && filters.limit !== 24) params.set('limit', filters.limit.toString());
    
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleSearch = (searchQuery: string) => {
    console.log("Search query:", searchQuery);
    setFilters(prev => ({
      ...prev,
      search: searchQuery,
      page: 1 // Reset to first page on new search
    }));
  };

  const handleSortChange = (sortValue: string) => {
    console.log("Sort changed:", sortValue);
    setFilters(prev => ({
      ...prev,
      sortBy: sortValue,
      page: 1 // Reset to first page on sort change
    }));
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    console.log("Filters changed:", newFilters);
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page on filter change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductsPerPageChange = (limit: number) => {
    setFilters(prev => ({
      ...prev,
      limit,
      page: 1 // Reset to first page when changing items per page
    }));
  };

  const clearFilters = () => {
    console.log("Clearing all filters");
    setFilters({
      sortBy: 'relevans',
      page: 1,
      limit: filters.limit
    });
    toast({
      title: "Filtren har rensats",
      description: "Alla filter har tagits bort.",
    });
  };

  return (
    <Layout>
      <ProductsHero />
      
      <div className="container mx-auto px-4 py-4 mb-6">
        <ProductSearch 
          searchQuery={filters.search || ''} 
          onSearch={handleSearch} 
        />
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/4">
            <div className="lg:sticky lg:top-24">
              <ProductFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                categories={categories}
                onClearFilters={clearFilters}
                isOpen={isFilterOpen}
                onToggle={() => setIsFilterOpen(!isFilterOpen)}
              />
            </div>
          </div>
          
          <div className="lg:w-3/4">
            <ProductSort
              sortBy={filters.sortBy || 'relevans'}
              onSortChange={handleSortChange}
              totalProducts={productData?.count}
              isLoading={isLoading}
              error={error as Error}
              productsPerPage={filters.limit || 24}
              onProductsPerPageChange={handleProductsPerPageChange}
            />
            
            <ProductGrid
              products={productData?.data || []}
              isLoading={isLoading}
              error={error as Error}
              totalProducts={productData?.count}
              currentPage={filters.page || 1}
              productsPerPage={filters.limit || 24}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Products;
