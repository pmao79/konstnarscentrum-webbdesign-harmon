
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
    categories: true,
    price: true,
    brands: true
  });

  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<{ name: string; subcategories: string[] }[]>([]);

  // Fetch available categories and brands from the database
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        // Fetch unique categories
        const { data: categoryData, error: categoryError } = await supabase
          .from('products')
          .select('category')
          .not('category', 'is', null);
        
        if (categoryError) {
          console.error('Error fetching categories:', categoryError);
        } else if (categoryData) {
          // Extract unique categories
          const uniqueCategories = Array.from(
            new Set(categoryData.map(item => item.category).filter(Boolean))
          );

          // Create category objects with subcategories
          const formattedCategories = uniqueCategories.map(category => ({
            name: category,
            subcategories: [] // For now, we'll leave subcategories empty
          }));

          setAvailableCategories(formattedCategories);
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
          
          setAvailableBrands(uniqueSuppliers);
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
  }, [filters.priceRange]);

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

  const handleCategoryChange = (category: string) => {
    onFilterChange({
      ...filters,
      category: filters.category === category ? undefined : category,
      subcategory: undefined // Reset subcategory when changing category
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

  const activeFilterCount = [
    filters.category, 
    filters.subcategory, 
    filters.brand, 
    (filters.priceRange?.min !== undefined || filters.priceRange?.max !== undefined)
  ].filter(Boolean).length;

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
          {/* Categories Section */}
          <div className="border-b pb-4">
            <div 
              className="flex justify-between items-center cursor-pointer mb-2" 
              onClick={() => toggleSection('categories')}
            >
              <h4 className="font-medium">Kategorier</h4>
              {expandedSections.categories ? 
                <ChevronUp className="h-4 w-4" /> : 
                <ChevronDown className="h-4 w-4" />
              }
            </div>
            
            {expandedSections.categories && (
              <div className="space-y-3">
                {availableCategories.length > 0 ? (
                  availableCategories.map((category) => (
                    <div key={category.name} className="space-y-1">
                      <div className="flex items-center">
                        <Checkbox 
                          id={category.name} 
                          checked={filters.category === category.name}
                          onCheckedChange={() => handleCategoryChange(category.name)}
                          className="mr-2"
                        />
                        <label 
                          htmlFor={category.name} 
                          className={`text-sm ${filters.category === category.name ? "font-medium" : ""}`}
                        >
                          {category.name}
                        </label>
                      </div>
                      
                      {filters.category === category.name && category.subcategories.length > 0 && (
                        <div className="ml-6 space-y-1 mt-1">
                          {category.subcategories.map((subcategory) => (
                            <div key={subcategory} className="flex items-center">
                              <Checkbox 
                                id={subcategory} 
                                checked={filters.subcategory === subcategory}
                                onCheckedChange={() => handleSubcategoryChange(subcategory)}
                                className="mr-2"
                              />
                              <label 
                                htmlFor={subcategory} 
                                className={`text-sm ${filters.subcategory === subcategory ? "font-medium" : ""}`}
                              >
                                {subcategory}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : categories.map((category) => (
                  <div key={category.name} className="space-y-1">
                    <div className="flex items-center">
                      <Checkbox 
                        id={category.name} 
                        checked={filters.category === category.name}
                        onCheckedChange={() => handleCategoryChange(category.name)}
                        className="mr-2"
                      />
                      <label 
                        htmlFor={category.name} 
                        className={`text-sm ${filters.category === category.name ? "font-medium" : ""}`}
                      >
                        {category.name}
                      </label>
                    </div>
                    
                    {filters.category === category.name && (
                      <div className="ml-6 space-y-1 mt-1">
                        {category.subcategories.map((subcategory) => (
                          <div key={subcategory} className="flex items-center">
                            <Checkbox 
                              id={subcategory} 
                              checked={filters.subcategory === subcategory}
                              onCheckedChange={() => handleSubcategoryChange(subcategory)}
                              className="mr-2"
                            />
                            <label 
                              htmlFor={subcategory} 
                              className={`text-sm ${filters.subcategory === subcategory ? "font-medium" : ""}`}
                            >
                              {subcategory}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
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
          <div className="pb-2">
            <div 
              className="flex justify-between items-center cursor-pointer mb-2" 
              onClick={() => toggleSection('brands')}
            >
              <h4 className="font-medium">Varumärken</h4>
              {expandedSections.brands ? 
                <ChevronUp className="h-4 w-4" /> : 
                <ChevronDown className="h-4 w-4" />
              }
            </div>
            
            {expandedSections.brands && (
              <div className="space-y-2">
                {availableBrands.length > 0 ? availableBrands.map((brand) => (
                  <div key={brand} className="flex items-center">
                    <Checkbox 
                      id={`brand-${brand}`} 
                      checked={filters.brand === brand}
                      onCheckedChange={() => handleBrandChange(brand)}
                      className="mr-2"
                    />
                    <label 
                      htmlFor={`brand-${brand}`} 
                      className={`text-sm ${filters.brand === brand ? "font-medium" : ""}`}
                    >
                      {brand}
                    </label>
                  </div>
                )) : (
                  <div className="text-sm text-muted-foreground">
                    Inga varumärken hittades
                  </div>
                )}
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
