import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Filter } from 'lucide-react';

interface FilterOption {
  id: string;
  name: string;
}

interface ProductFiltersProps {
  categories: FilterOption[];
  subcategories: FilterOption[];
  brands: FilterOption[];
  productGroups: FilterOption[];
  selectedCategories: string[];
  selectedSubcategories: string[];
  selectedBrands: string[];
  selectedProductGroups: string[];
  onCategoryChange: (categoryId: string) => void;
  onSubcategoryChange: (subcategoryId: string) => void;
  onBrandChange: (brandId: string) => void;
  onProductGroupChange: (productGroupId: string) => void;
}

export function ProductFilters({
  categories,
  subcategories,
  brands,
  productGroups,
  selectedCategories,
  selectedSubcategories,
  selectedBrands,
  selectedProductGroups,
  onCategoryChange,
  onSubcategoryChange,
  onBrandChange,
  onProductGroupChange,
}: ProductFiltersProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        <h3 className="font-medium">Filter</h3>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Kategorier</h4>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => onCategoryChange(category.id)}
                  />
                  <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        <div>
          <h4 className="text-sm font-medium mb-2">Underkategorier</h4>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {subcategories.map((subcategory) => (
                <div key={subcategory.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`subcategory-${subcategory.id}`}
                    checked={selectedSubcategories.includes(subcategory.id)}
                    onCheckedChange={() => onSubcategoryChange(subcategory.id)}
                  />
                  <Label htmlFor={`subcategory-${subcategory.id}`}>{subcategory.name}</Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        <div>
          <h4 className="text-sm font-medium mb-2">Varumärken</h4>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {brands.map((brand) => (
                <div key={brand.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand.id}`}
                    checked={selectedBrands.includes(brand.id)}
                    onCheckedChange={() => onBrandChange(brand.id)}
                  />
                  <Label htmlFor={`brand-${brand.id}`}>{brand.name}</Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        <div>
          <h4 className="text-sm font-medium mb-2">Produktgrupper</h4>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {productGroups.map((group) => (
                <div key={group.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`group-${group.id}`}
                    checked={selectedProductGroups.includes(group.id)}
                    onCheckedChange={() => onProductGroupChange(group.id)}
                  />
                  <Label htmlFor={`group-${group.id}`}>{group.name}</Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
} 