
interface ProductSortProps {
  sortBy: string;
  onSortChange: (value: string) => void;
  totalProducts?: number;
  isLoading?: boolean;
  error?: Error | null;
}

const ProductSort = ({ sortBy, onSortChange, totalProducts, isLoading, error }: ProductSortProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <span className="text-muted-foreground">
          {isLoading ? 'Laddar...' : 
           error ? 'Ett fel uppstod' :
           `Visar ${totalProducts || 0} produkter`}
        </span>
      </div>
      <div className="flex items-center">
        <label htmlFor="sort" className="text-sm mr-2">Sortera:</label>
        <select 
          id="sort"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="text-sm border border-art-sand rounded px-2 py-1"
        >
          <option value="relevans">Relevans</option>
          <option value="lagstPris">Lägst pris</option>
          <option value="hogstPris">Högst pris</option>
          <option value="nyast">Nyast</option>
          <option value="popularitet">Popularitet</option>
        </select>
      </div>
    </div>
  );
};

export default ProductSort;
