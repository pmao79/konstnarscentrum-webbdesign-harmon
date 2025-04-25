
import FilterSection from './FilterSection';
import FilterCheckbox from './FilterCheckbox';

interface BrandFilterProps {
  selectedBrand?: string;
  onBrandChange: (brand: string) => void;
  brands: string[];
  isExpanded: boolean;
  onToggle: () => void;
}

const BrandFilter: React.FC<BrandFilterProps> = ({
  selectedBrand,
  onBrandChange,
  brands,
  isExpanded,
  onToggle
}) => {
  return (
    <FilterSection 
      title="Varumärke" 
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      {brands.map((brand) => (
        <FilterCheckbox
          key={brand}
          id={`brand-${brand}`}
          label={brand}
          checked={selectedBrand === brand}
          onChange={() => onBrandChange(brand)}
        />
      ))}
    </FilterSection>
  );
};

export default BrandFilter;
