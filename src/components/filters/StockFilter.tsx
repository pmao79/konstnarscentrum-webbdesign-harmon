
import FilterSection from './FilterSection';
import FilterCheckbox from './FilterCheckbox';

interface StockFilterProps {
  inStockOnly: boolean;
  onInStockChange: (checked: boolean) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

const StockFilter: React.FC<StockFilterProps> = ({
  inStockOnly,
  onInStockChange,
  isExpanded,
  onToggle
}) => {
  return (
    <FilterSection 
      title="Lagerstatus" 
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <FilterCheckbox
        id="in-stock-filter"
        label="Visa endast produkter i lager"
        checked={inStockOnly}
        onChange={onInStockChange}
      />
    </FilterSection>
  );
};

export default StockFilter;
