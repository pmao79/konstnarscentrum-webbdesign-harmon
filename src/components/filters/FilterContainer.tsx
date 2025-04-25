
import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FilterX, Filter } from 'lucide-react';
import PaintTypeFilter from './PaintTypeFilter';
import BrushTypeFilter from './BrushTypeFilter';
import PaperTypeFilter from './PaperTypeFilter';
import ProductGroupFilter from './ProductGroupFilter';
import BrandFilter from './BrandFilter';
import StockFilter from './StockFilter';
import { FilterOptions } from '@/hooks/useProducts';

interface FilterContainerProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  categories: { name: string; subcategories: string[] }[];
  onClearFilters: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

const FilterContainer: React.FC<FilterContainerProps> = ({
  filters,
  onFilterChange,
  categories,
  onClearFilters,
  isOpen = true,
  onToggle
}) => {
  const [expandedSections, setExpandedSections] = useState({
    paintTypes: true,
    brushTypes: true,
    paperTypes: true,
    productGroups: true,
    brands: true,
    inStock: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Extract unique subcategories by type
  const paintTypes = categories
    .flatMap(cat => cat.subcategories)
    .filter(subcat => 
      subcat.toLowerCase().includes('färg') || 
      subcat.toLowerCase().includes('akvarell') || 
      subcat.toLowerCase().includes('gouache') ||
      subcat.toLowerCase().includes('tempera')
    );

  const brushTypes = categories
    .flatMap(cat => cat.subcategories)
    .filter(subcat => 
      subcat.toLowerCase().includes('pensel') || 
      subcat.toLowerCase().includes('borste')
    );

  const paperTypes = categories
    .flatMap(cat => cat.subcategories)
    .filter(subcat => 
      subcat.toLowerCase().includes('papper') || 
      subcat.toLowerCase().includes('block') ||
      subcat.toLowerCase().includes('canvas')
    );

  const activeFilterCount = [
    filters.subcategory,
    filters.brand,
    filters.productGroup,
    filters.inStock
  ].filter(Boolean).length;

  const handleSubcategoryChange = (subcategory: string) => {
    onFilterChange({
      ...filters,
      subcategory: filters.subcategory === subcategory ? undefined : subcategory,
      page: 1
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-art-sand">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">Filtrera</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="font-normal">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {activeFilterCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearFilters}
              className="text-sm flex items-center h-8 px-2"
            >
              <FilterX className="h-4 w-4 mr-1" /> Rensa
            </Button>
          )}
          {onToggle && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onToggle}
              className="text-sm lg:hidden flex items-center h-8 px-2"
            >
              <Filter className="h-4 w-4 mr-1" />
              {isOpen ? "Dölj" : "Visa"}
            </Button>
          )}
        </div>
      </div>

      {(isOpen || window.innerWidth >= 1024) && (
        <div className="space-y-6">
          <PaintTypeFilter 
            selectedType={filters.subcategory}
            onTypeChange={handleSubcategoryChange}
            paintTypes={paintTypes}
            isExpanded={expandedSections.paintTypes}
            onToggle={() => toggleSection('paintTypes')}
          />
          
          <BrushTypeFilter 
            selectedType={filters.subcategory}
            onTypeChange={handleSubcategoryChange}
            brushTypes={brushTypes}
            isExpanded={expandedSections.brushTypes}
            onToggle={() => toggleSection('brushTypes')}
          />
          
          <PaperTypeFilter 
            selectedType={filters.subcategory}
            onTypeChange={handleSubcategoryChange}
            paperTypes={paperTypes}
            isExpanded={expandedSections.paperTypes}
            onToggle={() => toggleSection('paperTypes')}
          />
          
          <ProductGroupFilter 
            selectedGroup={filters.productGroup}
            onGroupChange={(group) => onFilterChange({ ...filters, productGroup: group, page: 1 })}
            productGroups={[...new Set(categories.map(cat => cat.name))]}
            isExpanded={expandedSections.productGroups}
            onToggle={() => toggleSection('productGroups')}
          />
          
          <BrandFilter 
            selectedBrand={filters.brand}
            onBrandChange={(brand) => onFilterChange({ ...filters, brand, page: 1 })}
            brands={[...new Set(categories.flatMap(cat => cat.subcategories))]}
            isExpanded={expandedSections.brands}
            onToggle={() => toggleSection('brands')}
          />
          
          <StockFilter 
            inStockOnly={filters.inStock || false}
            onInStockChange={(checked) => onFilterChange({ ...filters, inStock: checked, page: 1 })}
            isExpanded={expandedSections.inStock}
            onToggle={() => toggleSection('inStock')}
          />

          <div className="pt-2 lg:hidden">
            <Button className="w-full" onClick={onToggle}>
              Använd filter
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterContainer;
