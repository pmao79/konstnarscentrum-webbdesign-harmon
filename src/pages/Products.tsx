
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ProductFilters from '@/components/ProductFilters';
import ProductsHero from '@/components/shop/ProductsHero';
import ProductSearch from '@/components/shop/ProductSearch';
import ProductSort from '@/components/shop/ProductSort';
import ProductGrid from '@/components/shop/ProductGrid';
import { useProducts, FilterOptions } from '@/hooks/useProducts';

const categories = [
  { name: "Färg", subcategories: ["Akvarell", "Akryl", "Olja", "Gouache"] },
  { name: "Penslar", subcategories: ["Akvarellpenslar", "Akrylpenslar", "Oljepenslar"] },
  { name: "Papper", subcategories: ["Akvarellpapper", "Skissblock", "Canvas"] },
  { name: "Stafflier", subcategories: ["Bordsställ", "Golvstaffli", "Fältstaffli"] },
  { name: "Böcker", subcategories: ["Teknikböcker", "Inspiration"] },
];

const Products = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sortBy, setSortBy] = useState("relevans");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: products, isLoading, error } = useProducts({
    ...filters,
    search: searchQuery,
  });

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const clearFilters = () => {
    setFilters({});
  };

  return (
    <Layout>
      <ProductsHero />
      <ProductSearch searchQuery={searchQuery} onSearch={handleSearch} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/4">
            <ProductFilters
              filters={filters}
              onFilterChange={setFilters}
              categories={categories}
              onClearFilters={clearFilters}
            />
          </div>
          
          <div className="lg:w-3/4">
            <ProductSort
              sortBy={sortBy}
              onSortChange={setSortBy}
              totalProducts={products?.length}
              isLoading={isLoading}
              error={error}
            />
            
            <ProductGrid
              products={products}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Products;
