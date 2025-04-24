
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import ProductFilters from '@/components/ProductFilters';
import ProductCard from '@/components/ProductCard';
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
      {/* Hero Banner */}
      <div className="bg-art-sky py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-serif font-medium mb-4">Utforska Vårt Sortiment</h1>
          <p className="text-lg max-w-xl">Upptäck vårt breda urval av konstnärsmaterial för alla tekniker och stilar.</p>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="container mx-auto px-4 py-4">
        <Input
          type="search"
          placeholder="Sök produkter..."
          value={searchQuery}
          onChange={handleSearch}
          className="max-w-md"
        />
      </div>
      
      {/* Product Listing */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <ProductFilters
              filters={filters}
              onFilterChange={setFilters}
              categories={categories}
              onClearFilters={clearFilters}
            />
          </div>
          
          {/* Product Grid */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <div>
                <span className="text-muted-foreground">
                  {isLoading ? 'Laddar...' : 
                   error ? 'Ett fel uppstod' :
                   `Visar ${products?.length || 0} produkter`}
                </span>
              </div>
              <div className="flex items-center">
                <label htmlFor="sort" className="text-sm mr-2">Sortera:</label>
                <select 
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-art-sand rounded px-2 py-1"
                >
                  <option value="relevans">Relevans</option>
                  <option value="lagstPris">Lägst pris</option>
                  <option value="hogstPris">Högst pris</option>
                  <option value="nyast">Nyast</option>
                  <option value="popularitet">Popularitet</option>
                </select>
              </div>
            </div>
            
            {isLoading ? (
              <div>Laddar produkter...</div>
            ) : error ? (
              <div>Ett fel uppstod när produkterna skulle laddas.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products?.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Products;
