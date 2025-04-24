
import React from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface ProductFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedSubcategory: string;
  onSubcategoryChange: (value: string) => void;
  selectedBrand: string;
  onBrandChange: (value: string) => void;
  selectedProductGroup: string;
  onProductGroupChange: (value: string) => void;
  inStockOnly: boolean;
  onInStockChange: (value: boolean) => void;
  categories: string[];
  subcategories: string[];
  brands: string[];
  productGroups: string[];
  onResetFilters: () => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedSubcategory,
  onSubcategoryChange,
  selectedBrand,
  onBrandChange,
  selectedProductGroup,
  onProductGroupChange,
  inStockOnly,
  onInStockChange,
  categories,
  subcategories,
  brands,
  productGroups,
  onResetFilters,
}) => {
  const showResetButton = search || 
    selectedCategory !== 'all' || 
    selectedSubcategory !== 'all' || 
    selectedBrand !== 'all' || 
    selectedProductGroup !== 'all' || 
    inStockOnly;

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
            <SelectValue placeholder="Produktkategori" />
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

        <Select value={selectedSubcategory} onValueChange={onSubcategoryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Underkategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Alla underkategorier</SelectItem>
              {subcategories.map(subcategory => (
                <SelectItem key={subcategory} value={subcategory}>
                  {subcategory}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        
        <Select value={selectedBrand} onValueChange={onBrandChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Varumärke" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Alla varumärken</SelectItem>
              {brands.map(brand => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={selectedProductGroup} onValueChange={onProductGroupChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Produktgrupp" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Alla produktgrupper</SelectItem>
              {productGroups.map(group => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Checkbox 
            id="inStock"
            checked={inStockOnly}
            onCheckedChange={onInStockChange}
          />
          <label
            htmlFor="inStock"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I lager
          </label>
        </div>
        
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
