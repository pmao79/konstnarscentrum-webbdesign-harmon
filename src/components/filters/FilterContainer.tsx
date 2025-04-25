
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
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

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

  // Fetch unique brands from database (supplier field)
  const { data: brandsData } = useQuery({
    queryKey: ['uniqueBrands'],
    queryFn: async () => {
      // Fetch unique suppliers (brands) from the products table
      const { data, error } = await supabase
        .from('products')
        .select('supplier')
        .not('supplier', 'is', null)
        .order('supplier');
      
      if (error) throw error;
      
      // Extract unique supplier values and filter out nulls and empty strings
      const uniqueBrands = Array.from(
        new Set(
          data
            .map(item => item.supplier)
            .filter(Boolean)
        )
      ).sort();
      
      return uniqueBrands as string[];
    }
  });
  
  // Fetch unique product groups
  const { data: productGroupsData } = useQuery({
    queryKey: ['uniqueProductGroups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('variant_name')
        .not('variant_name', 'is', null)
        .order('variant_name');
      
      if (error) throw error;
      
      const uniqueGroups = Array.from(
        new Set(
          data
            .map(item => item.variant_name)
            .filter(Boolean)
        )
      ).sort();
      
      return uniqueGroups as string[];
    }
  });

  // Fetch unique subcategories
  const { data: subcategoriesData } = useQuery({
    queryKey: ['uniqueSubcategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('variant_type')
        .not('variant_type', 'is', null)
        .order('variant_type');
      
      if (error) throw error;
      
      const uniqueSubcategories = Array.from(
        new Set(
          data
            .map(item => item.variant_type)
            .filter(Boolean)
        )
      ).sort();
      
      return uniqueSubcategories as string[];
    }
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Extract subcategories based on type
  const subcategories = subcategoriesData || [];
  
  // Filter subcategories by type
  const paintTypes = subcategories.filter(subcat => 
    subcat.toLowerCase().includes('färg') || 
    subcat.toLowerCase().includes('akvarell') || 
    subcat.toLowerCase().includes('gouache') ||
    subcat.toLowerCase().includes('tempera')
  );

  const brushTypes = subcategories.filter(subcat => 
    subcat.toLowerCase().includes('pensel') || 
    subcat.toLowerCase().includes('borste')
  );

  const paperTypes = subcategories.filter(subcat => 
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
          {paintTypes.length > 0 && (
            <PaintTypeFilter 
              selectedType={filters.subcategory}
              onTypeChange={handleSubcategoryChange}
              paintTypes={paintTypes}
              isExpanded={expandedSections.paintTypes}
              onToggle={() => toggleSection('paintTypes')}
            />
          )}
          
          {brushTypes.length > 0 && (
            <BrushTypeFilter 
              selectedType={filters.subcategory}
              onTypeChange={handleSubcategoryChange}
              brushTypes={brushTypes}
              isExpanded={expandedSections.brushTypes}
              onToggle={() => toggleSection('brushTypes')}
            />
          )}
          
          {paperTypes.length > 0 && (
            <PaperTypeFilter 
              selectedType={filters.subcategory}
              onTypeChange={handleSubcategoryChange}
              paperTypes={paperTypes}
              isExpanded={expandedSections.paperTypes}
              onToggle={() => toggleSection('paperTypes')}
            />
          )}
          
          <ProductGroupFilter 
            selectedGroup={filters.productGroup}
            onGroupChange={(group) => onFilterChange({ ...filters, productGroup: group, page: 1 })}
            productGroups={productGroupsData || []}
            isExpanded={expandedSections.productGroups}
            onToggle={() => toggleSection('productGroups')}
          />
          
          <BrandFilter 
            selectedBrand={filters.brand}
            onBrandChange={(brand) => onFilterChange({ ...filters, brand, page: 1 })}
            brands={brandsData || []}
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
