
import FilterSection from './FilterSection';
import FilterCheckbox from './FilterCheckbox';

interface PaperTypeFilterProps {
  selectedType?: string;
  onTypeChange: (type: string) => void;
  paperTypes: string[];
  isExpanded: boolean;
  onToggle: () => void;
}

const PaperTypeFilter: React.FC<PaperTypeFilterProps> = ({
  selectedType,
  onTypeChange,
  paperTypes,
  isExpanded,
  onToggle
}) => {
  return (
    <FilterSection 
      title="Papper" 
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      {paperTypes.map((type) => (
        <FilterCheckbox
          key={type}
          id={`paper-${type}`}
          label={type}
          checked={selectedType === type}
          onChange={() => onTypeChange(type)}
        />
      ))}
    </FilterSection>
  );
};

export default PaperTypeFilter;
