
import React from 'react';
import { Button } from '@/components/ui/button';

interface ProductStatsProps {
  filteredCount: number;
  totalCount: number;
  groupedView: boolean;
  onToggleView: () => void;
}

const ProductStats: React.FC<ProductStatsProps> = ({
  filteredCount,
  totalCount,
  groupedView,
  onToggleView,
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="text-xl">
        Produktlista {filteredCount > 0 && 
          <span className="text-sm font-normal text-muted-foreground ml-2">
            ({filteredCount} av {totalCount})
          </span>
        }
      </div>
      <Button
        variant="outline"
        onClick={onToggleView}
      >
        {groupedView ? 'Visa alla produkter' : 'Visa grupperade produkter'}
      </Button>
    </div>
  );
};

export default ProductStats;
