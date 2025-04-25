
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { FilterX, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { FilterOptions } from '@/hooks/useProducts';
import { cleanSupplierName } from '@/utils/productCategorization';
import { supabase } from "@/integrations/supabase/client";

interface ProductFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  categories: { name: string; subcategories: string[] }[];
  onClearFilters: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFilterChange,
  categories,
  onClearFilters,
  isOpen = true,
  onToggle
}) => {
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.priceRange?.min || 0, 
    filters.priceRange?.max || 2000
  ]);
  
  const [expandedSections, setExpandedSections] = useState({
    paintTypes: true,
    brushTypes: true,
    paperTypes: true,
    price: true,
    brands: true,
    productGroups: true,
    inStock: true
  });
  
  const [availableFilters, setAvailableFilters] = useState({
    paintTypes: [] as string[],
    brushTypes: [] as string[],
    paperTypes: [] as string[],
    brands: [] as string[],
    productGroups: [] as string[],
  });
  
  const [showInStock, setShowInStock] = useState(filters.inStock || false);

  // Fetch available filters from the database
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        // Fetch unique subcategories (for paint types, brush types, paper types)
        const { data: subcategoryData, error: subcategoryError } = await supabase
          .from('products')
          .select('variant_type')
          .not('variant_type', 'is', null);
        
        if (subcategoryError) {
          console.error('Error fetching subcategories:', subcategoryError);
        } else if (subcategoryData) {
          // Extract unique subcategories
          const subcategories = Array.from(
            new Set(subcategoryData.map(item => item.variant_type).filter(Boolean))
          ).sort();

          // Categorize subcategories
          const paintTypes = subcategories.filter(subcat => 
            subcat.toLowerCase().includes('färg') || 
            subcat.toLowerCase().includes('akvarell') || 
            subcat.toLowerCase().includes('gouache') || 
            subcat.toLowerCase().includes('tempera') ||
            subcat.toLowerCase().includes('olja')
          );
          
          const brushTypes = subcategories.filter(subcat => 
            subcat.toLowerCase().includes('pensel') || 
            subcat.toLowerCase().includes('borste')
          );
          
          const paperTypes = subcategories.filter(subcat => 
            subcat.toLowerCase().includes('papper') || 
            subcat.toLowerCase().includes('block') || 
            subcat.toLowerCase().includes('canvas') || 
            subcat.toLowerCase().includes('duk')
          );
          
          setAvailableFilters(prev => ({
            ...prev,
            paintTypes,
            brushTypes,
            paperTypes
          }));
        }
        
        // Fetch unique product groups
        const { data: groupData, error: groupError } = await supabase
          .from('products')
          .select('variant_name')
          .not('variant_name', 'is', null);
        
        if (groupError) {
          console.error('Error fetching product groups:', groupError);
        } else if (groupData) {
          const groups = Array.from(
            new Set(groupData.map(item => item.variant_name).filter(Boolean))
          ).sort();
          
          setAvailableFilters(prev => ({
            ...prev,
            productGroups: groups
          }));
        }
        
        // Fetch unique suppliers/brands
        const { data: supplierData, error: supplierError } = await supabase
          .from('products')
          .select('supplier')
          .not('supplier', 'is', null);
        
        if (supplierError) {
          console.error('Error fetching suppliers:', supplierError);
        } else if (supplierData) {
          // Clean and extract unique suppliers
          const uniqueSuppliers = Array.from(
            new Set(supplierData.map(item => cleanSupplierName(item.supplier)).filter(Boolean))
          ).sort();
          
          setAvailableFilters(prev => ({
            ...prev,
            brands: uniqueSuppliers
          }));
        }
      } catch (err) {
        console.error('Error fetching filter data:', err);
      }
    };
    
    fetchFilters();
  }, []);

  // Update local price range when filters prop changes (e.g. on reset)
  useEffect(() => {
    setPriceRange([
      filters.priceRange?.min || 0,
      filters.priceRange?.max || 2000
    ]);
    setShowInStock(filters.inStock || false);
  }, [filters.priceRange, filters.inStock]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };

  const applyPriceFilter = () => {
    onFilterChange({
      ...filters,
      priceRange: {
        min: priceRange[0],
        max: priceRange[1]
      }
    });
  };

  const handleInStockChange = (checked: boolean) => {
    setShowInStock(checked);
    onFilterChange({
      ...filters,
      inStock: checked
    });
  };

  const handleSubcategoryChange = (subcategory: string) => {
    onFilterChange({
      ...filters,
      subcategory: filters.subcategory === subcategory ? undefined : subcategory
    });
  };

  const handleBrandChange = (brand: string) => {
    onFilterChange({
      ...filters,
      brand: filters.brand === brand ? undefined : brand
    });
  };
  
  const handleProductGroupChange = (group: string) => {
    onFilterChange({
      ...filters,
      productGroup: filters.productGroup === group ? undefined : group
    });
  };

  const activeFilterCount = [
    filters.category, 
    filters.subcategory, 
    filters.brand,
    filters.productGroup,
    filters.inStock,
    (filters.priceRange?.min !== undefined || filters.priceRange?.max !== undefined)
  ].filter(Boolean).length;

  // Helper function to render a filter section
  const renderFilterSection = (
    title: string, 
    sectionKey: keyof typeof expandedSections, 
    items: string[], 
    selectedItem: string | undefined, 
    onChange: (item: string) => void
  ) => {
    if (items.length === 0) return null;
    
    return (
      <div className="border-b pb-4">
        <div 
          className="flex justify-between items-center cursor-pointer mb-2" 
          onClick={() => toggleSection(sectionKey)}
        >
          <h4 className="font-medium">{title}</h4>
          {expandedSections[sectionKey] ? 
            <ChevronUp className="h-4 w-4" /> : 
            <ChevronDown className="h-4 w-4" />
          }
        </div>
        
        {expandedSections[sectionKey] && (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item} className="flex items-center">
                <Checkbox 
                  id={`${sectionKey}-${item}`} 
                  checked={selectedItem === item}
                  onCheckedChange={() => onChange(item)}
                  className="mr-2"
                />
                <label 
                  htmlFor={`${sectionKey}-${item}`} 
                  className={`text-sm ${selectedItem === item ? "font-medium" : ""}`}
                >
                  {item}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    );
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
          {/* Paint Types Section */}
          {renderFilterSection(
            'Färgtyp / Målarteknik', 
            'paintTypes', 
            availableFilters.paintTypes,
            filters.subcategory,
            handleSubcategoryChange
          )}
          
          {/* Brush Types Section */}
          {renderFilterSection(
            'Penslar', 
            'brushTypes', 
            availableFilters.brushTypes,
            filters.subcategory,
            handleSubcategoryChange
          )}
          
          {/* Paper Types Section */}
          {renderFilterSection(
            'Papper', 
            'paperTypes', 
            availableFilters.paperTypes,
            filters.subcategory,
            handleSubcategoryChange
          )}
          
          {/* Product Groups Section */}
          {renderFilterSection(
            'Produktgrupp', 
            'productGroups', 
            availableFilters.productGroups,
            filters.productGroup,
            handleProductGroupChange
          )}
          
          {/* Price Range Section */}
          <div className="border-b pb-4">
            <div 
              className="flex justify-between items-center cursor-pointer mb-3" 
              onClick={() => toggleSection('price')}
            >
              <h4 className="font-medium">Pris</h4>
              {expandedSections.price ? 
                <ChevronUp className="h-4 w-4" /> : 
                <ChevronDown className="h-4 w-4" />
              }
            </div>
            
            {expandedSections.price && (
              <div className="space-y-4">
                <Slider 
                  defaultValue={priceRange}
                  min={0}
                  max={2000}
                  step={10}
                  value={priceRange}
                  onValueChange={handlePriceRangeChange}
                  className="my-6"
                />
                
                <div className="flex gap-4 items-center">
                  <div>
                    <label htmlFor="min-price" className="text-xs text-muted-foreground mb-1 block">Från</label>
                    <Input
                      id="min-price"
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <label htmlFor="max-price" className="text-xs text-muted-foreground mb-1 block">Till</label>
                    <Input
                      id="max-price"
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 0])}
                      className="h-8"
                    />
                  </div>
                  <Button 
                    size="sm" 
                    onClick={applyPriceFilter} 
                    className="mt-5 h-8"
                  >
                    OK
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Brands Section */}
          {renderFilterSection(
            'Varumärke', 
            'brands', 
            availableFilters.brands,
            filters.brand,
            handleBrandChange
          )}
          
          {/* In Stock Section */}
          <div className="pb-2">
            <div 
              className="flex justify-between items-center cursor-pointer mb-2" 
              onClick={() => toggleSection('inStock')}
            >
              <h4 className="font-medium">Lagerstatus</h4>
              {expandedSections.inStock ? 
                <ChevronUp className="h-4 w-4" /> : 
                <ChevronDown className="h-4 w-4" />
              }
            </div>
            
            {expandedSections.inStock && (
              <div className="flex items-center">
                <Checkbox 
                  id="in-stock-filter" 
                  checked={showInStock}
                  onCheckedChange={handleInStockChange}
                  className="mr-2"
                />
                <label 
                  htmlFor="in-stock-filter" 
                  className={`text-sm ${showInStock ? "font-medium" : ""}`}
                >
                  Visa endast produkter i lager
                </label>
              </div>
            )}
          </div>
          
          {/* Bottom Action Button for Mobile */}
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

export default ProductFilters;
