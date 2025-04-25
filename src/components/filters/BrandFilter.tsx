
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
      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
        {brands.length === 0 ? (
          <p className="text-sm text-muted-foreground">Laddar varumärken...</p>
        ) : (
          brands.map((brand) => (
            <FilterCheckbox
              key={brand}
              id={`brand-${brand}`}
              label={brand}
              checked={selectedBrand === brand}
              onChange={() => onBrandChange(brand)}
            />
          ))
        )}
      </div>
    </FilterSection>
  );
};

export default BrandFilter;
