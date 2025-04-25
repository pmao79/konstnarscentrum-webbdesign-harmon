
import FilterSection from './FilterSection';
import FilterCheckbox from './FilterCheckbox';

interface PaintTypeFilterProps {
  selectedType?: string;
  onTypeChange: (type: string) => void;
  paintTypes: string[];
  isExpanded: boolean;
  onToggle: () => void;
}

const PaintTypeFilter: React.FC<PaintTypeFilterProps> = ({
  selectedType,
  onTypeChange,
  paintTypes,
  isExpanded,
  onToggle
}) => {
  return (
    <FilterSection 
      title="Färgtyp / Målarteknik" 
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      {paintTypes.map((type) => (
        <FilterCheckbox
          key={type}
          id={`paint-${type}`}
          label={type}
          checked={selectedType === type}
          onChange={() => onTypeChange(type)}
        />
      ))}
    </FilterSection>
  );
};

export default PaintTypeFilter;
