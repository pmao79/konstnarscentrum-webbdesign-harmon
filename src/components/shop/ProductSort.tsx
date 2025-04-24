
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductSortProps {
  sortBy: string;
  onSortChange: (value: string) => void;
  totalProducts?: number;
  isLoading?: boolean;
  error?: Error | null;
  productsPerPage: number;
  onProductsPerPageChange: (value: number) => void;
}

const ProductSort = ({ 
  sortBy, 
  onSortChange, 
  totalProducts, 
  isLoading, 
  error,
  productsPerPage,
  onProductsPerPageChange
}: ProductSortProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <span className="text-muted-foreground">
          {isLoading ? 'Laddar...' : 
           error ? 'Ett fel uppstod' :
           `Visar ${totalProducts || 0} produkter`}
        </span>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center">
          <label htmlFor="productsPerPage" className="text-sm mr-2">Visa:</label>
          <Select 
            value={productsPerPage.toString()} 
            onValueChange={(value) => onProductsPerPageChange(Number(value))}
          >
            <SelectTrigger className="w-[80px]" id="productsPerPage">
              <SelectValue placeholder="24" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24">24</SelectItem>
              <SelectItem value="48">48</SelectItem>
              <SelectItem value="96">96</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center">
          <label htmlFor="sort" className="text-sm mr-2">Sortera:</label>
          <Select 
            value={sortBy} 
            onValueChange={onSortChange}
          >
            <SelectTrigger className="w-[150px]" id="sort">
              <SelectValue placeholder="Relevans" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevans">Relevans</SelectItem>
              <SelectItem value="lagstPris">Lägst pris</SelectItem>
              <SelectItem value="hogstPris">Högst pris</SelectItem>
              <SelectItem value="nyast">Nyast</SelectItem>
              <SelectItem value="popularitet">Popularitet</SelectItem>
              <SelectItem value="namn_asc">Namn A-Ö</SelectItem>
              <SelectItem value="namn_desc">Namn Ö-A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ProductSort;
