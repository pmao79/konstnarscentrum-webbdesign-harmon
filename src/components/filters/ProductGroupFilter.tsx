
import FilterSection from './FilterSection';
import FilterCheckbox from './FilterCheckbox';

interface ProductGroupFilterProps {
  selectedGroup?: string;
  onGroupChange: (group: string) => void;
  productGroups: string[];
  isExpanded: boolean;
  onToggle: () => void;
}

const ProductGroupFilter: React.FC<ProductGroupFilterProps> = ({
  selectedGroup,
  onGroupChange,
  productGroups,
  isExpanded,
  onToggle
}) => {
  return (
    <FilterSection 
      title="Produktgrupp" 
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      {productGroups.map((group) => (
        <FilterCheckbox
          key={group}
          id={`group-${group}`}
          label={group}
          checked={selectedGroup === group}
          onChange={() => onGroupChange(group)}
        />
      ))}
    </FilterSection>
  );
};

export default ProductGroupFilter;

