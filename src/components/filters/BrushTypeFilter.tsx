
import FilterSection from './FilterSection';
import FilterCheckbox from './FilterCheckbox';

interface BrushTypeFilterProps {
  selectedType?: string;
  onTypeChange: (type: string) => void;
  brushTypes: string[];
  isExpanded: boolean;
  onToggle: () => void;
}

const BrushTypeFilter: React.FC<BrushTypeFilterProps> = ({
  selectedType,
  onTypeChange,
  brushTypes,
  isExpanded,
  onToggle
}) => {
  return (
    <FilterSection 
      title="Penslar" 
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      {brushTypes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Inga penseltyper hittades</p>
      ) : (
        brushTypes.map((type) => (
          <FilterCheckbox
            key={type}
            id={`brush-${type}`}
            label={type}
            checked={selectedType === type}
            onChange={() => onTypeChange(type)}
          />
        ))
      )}
    </FilterSection>
  );
};

export default BrushTypeFilter;
