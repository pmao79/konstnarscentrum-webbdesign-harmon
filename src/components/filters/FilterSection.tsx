
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FilterSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  isExpanded,
  onToggle,
  children
}) => {
  return (
    <div className="border-b pb-4">
      <div 
        className="flex justify-between items-center cursor-pointer mb-2" 
        onClick={onToggle}
      >
        <h4 className="font-medium">{title}</h4>
        {isExpanded ? 
          <ChevronUp className="h-4 w-4" /> : 
          <ChevronDown className="h-4 w-4" />
        }
      </div>
      {isExpanded && (
        <div className="space-y-2">
          {children}
        </div>
      )}
    </div>
  );
};

export default FilterSection;

