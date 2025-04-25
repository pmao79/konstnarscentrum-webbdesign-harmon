
import { Checkbox } from "@/components/ui/checkbox";

interface FilterCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const FilterCheckbox: React.FC<FilterCheckboxProps> = ({
  id,
  label,
  checked,
  onChange
}) => {
  return (
    <div className="flex items-center">
      <Checkbox 
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        className="mr-2"
      />
      <label 
        htmlFor={id} 
        className={`text-sm ${checked ? "font-medium" : ""}`}
      >
        {label}
      </label>
    </div>
  );
};

export default FilterCheckbox;
