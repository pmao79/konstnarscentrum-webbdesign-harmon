
import FilterSection from './FilterSection';
import FilterCheckbox from './FilterCheckbox';

interface MaterialFilterProps {
  selectedMaterial?: string;
  onMaterialChange: (material: string) => void;
  materials: string[];
  isExpanded: boolean;
  onToggle: () => void;
}

const MaterialFilter: React.FC<MaterialFilterProps> = ({
  selectedMaterial,
  onMaterialChange,
  materials,
  isExpanded,
  onToggle
}) => {
  return (
    <FilterSection 
      title="Materialtyp" 
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      {materials.map((material) => (
        <FilterCheckbox
          key={material}
          id={`material-${material}`}
          label={material}
          checked={selectedMaterial === material}
          onChange={() => onMaterialChange(material)}
        />
      ))}
    </FilterSection>
  );
};

export default MaterialFilter;
