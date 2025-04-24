
import React from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedSupplier: string;
  onSupplierChange: (value: string) => void;
  categories: string[];
  suppliers: string[];
  onResetFilters: () => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedSupplier,
  onSupplierChange,
  categories,
  suppliers,
  onResetFilters,
}) => {
  const showResetButton = search || selectedCategory !== 'all' || selectedSupplier !== 'all';

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Sök produkter..." 
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Alla kategorier</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        
        <Select value={selectedSupplier} onValueChange={onSupplierChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Leverantör" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Alla leverantörer</SelectItem>
              {suppliers.map(supplier => (
                <SelectItem key={supplier} value={supplier}>
                  {supplier}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        
        {showResetButton && (
          <Button 
            variant="ghost" 
            onClick={onResetFilters}
          >
            Återställ filter
          </Button>
        )}
      </div>
      
      <Button>
        <Plus className="mr-2 h-4 w-4" /> 
        Lägg till produkt
      </Button>
    </div>
  );
};

export default ProductFilters;
