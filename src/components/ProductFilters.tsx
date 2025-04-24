
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { FilterOptions } from '@/hooks/useProducts';

interface ProductFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  categories: { name: string; subcategories: string[] }[];
  onClearFilters: () => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFilterChange,
  categories,
  onClearFilters,
}) => {
  const [minPrice, setMinPrice] = React.useState(filters.priceRange?.min?.toString() || '');
  const [maxPrice, setMaxPrice] = React.useState(filters.priceRange?.max?.toString() || '');

  const handlePriceChange = () => {
    onFilterChange({
      ...filters,
      priceRange: {
        min: minPrice ? Number(minPrice) : undefined,
        max: maxPrice ? Number(maxPrice) : undefined,
      },
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-art-sand">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Filtrera</h3>
        {(filters.category || filters.priceRange?.min || filters.priceRange?.max) && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-sm flex items-center">
            <XCircle className="h-4 w-4 mr-1" /> Rensa
          </Button>
        )}
      </div>
      
      {categories.map((category) => (
        <div key={category.name} className="mb-4">
          <h4 className="font-medium mb-2">{category.name}</h4>
          <div className="space-y-1">
            {category.subcategories.map((subcat) => (
              <div key={subcat} className="flex items-center">
                <input 
                  type="checkbox" 
                  id={subcat} 
                  className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={filters.category === subcat}
                  onChange={() => onFilterChange({
                    ...filters,
                    category: filters.category === subcat ? undefined : subcat,
                  })}
                />
                <label htmlFor={subcat} className="text-sm">{subcat}</label>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <div className="mb-4">
        <h4 className="font-medium mb-2">Pris</h4>
        <div className="grid grid-cols-2 gap-2">
          <Input 
            type="number" 
            placeholder="Min" 
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={handlePriceChange}
            className="px-2 py-1"
          />
          <Input 
            type="number" 
            placeholder="Max" 
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={handlePriceChange}
            className="px-2 py-1"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
