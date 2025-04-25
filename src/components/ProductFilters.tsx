
import { FilterOptions } from '@/hooks/useProducts';
import FilterContainer from './filters/FilterContainer';

interface ProductFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  categories: { name: string; subcategories: string[] }[];
  onClearFilters: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = (props) => {
  // Add a console.log to verify the component is rendering with the correct props
  console.log('ProductFilters props:', props);
  return <FilterContainer {...props} />;
};

export default ProductFilters;
