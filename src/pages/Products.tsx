
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
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

// Based on existing product categories in the database
const categories = [
  { name: "Färg", subcategories: ["Akvarellfärg", "Akrylfärg", "Oljefärg", "Gouache"] },
  { name: "Penslar", subcategories: ["Akvarellpenslar", "Akrylpenslar", "Oljepenslar"] },
  { name: "Papper", subcategories: ["Akvarellpapper", "Skissblock", "Canvas"] },
  { name: "Stafflier", subcategories: ["Bordsställ", "Golvstaffli", "Fältstaffli"] },
  { name: "Böcker", subcategories: ["Teknikböcker"] },
  { name: "Tillbehör", subcategories: ["Paletter", "Verktyg"] },
];

const Products = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize state from URL parameters
  const [filters, setFilters] = useState<FilterOptions>({
    category: searchParams.get('category') || undefined,
    subcategory: searchParams.get('subcategory') || undefined,
    brand: searchParams.get('brand') || undefined,
    productGroup: searchParams.get('productGroup') || undefined,
    search: searchParams.get('search') || '',
    inStock: searchParams.get('inStock') === 'true',
    priceRange: {
      min: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      max: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    },
    sortBy: searchParams.get('sort') || 'relevans',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 24,
  });
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { data: productData, isLoading, error, refetch } = useProducts(filters);

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
    if (filters.productGroup) params.set('productGroup', filters.productGroup);
    if (filters.search) params.set('search', filters.search);
    if (filters.inStock) params.set('inStock', 'true');
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

  const isFiltered = !!(filters.category || filters.subcategory || filters.brand || 
                       filters.productGroup || filters.inStock ||
                       filters.search || filters.priceRange?.min || filters.priceRange?.max);

  const NoProductsFound = () => (
    <div className="text-center py-10">
      <h3 className="text-lg font-medium mb-2">Inga produkter hittades</h3>
      <p className="text-muted-foreground mb-6">
        Vi hittade inga produkter som matchar dina valda filter
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={clearFilters} variant="default">
          <RefreshCw className="h-4 w-4 mr-2" />
          Rensa alla filter
        </Button>
        <Button onClick={() => refetch()} variant="outline">
          Försök igen
        </Button>
      </div>
    </div>
  );

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
            
            {productData?.count === 0 && isFiltered && !isLoading ? (
              <NoProductsFound />
            ) : (
              <ProductGrid
                products={productData?.data || []}
                isLoading={isLoading}
                error={error as Error}
                totalProducts={productData?.count}
                currentPage={filters.page || 1}
                productsPerPage={filters.limit || 24}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Products;
