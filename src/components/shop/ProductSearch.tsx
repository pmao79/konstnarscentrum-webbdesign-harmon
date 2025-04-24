
import { Input } from "@/components/ui/input";

interface ProductSearchProps {
  searchQuery: string;
  onSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProductSearch = ({ searchQuery, onSearch }: ProductSearchProps) => {
  return (
    <div className="container mx-auto px-4 py-4">
      <Input
        type="search"
        placeholder="Sök produkter..."
        value={searchQuery}
        onChange={onSearch}
        className="max-w-md"
      />
    </div>
  );
};

export default ProductSearch;
