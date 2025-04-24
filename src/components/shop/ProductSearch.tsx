
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { debounce } from "lodash";

interface ProductSearchProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  placeholder?: string;
}

const ProductSearch = ({ searchQuery, onSearch, placeholder = "Sök produkter..." }: ProductSearchProps) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  
  // Debounce the search to avoid too many requests
  const debouncedSearch = debounce((value) => {
    onSearch(value);
  }, 300);
  
  // Update local state when prop changes (e.g. when filters are reset)
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);
  
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setLocalQuery(value);
    debouncedSearch(value);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        type="search"
        placeholder={placeholder}
        value={localQuery}
        onChange={handleSearchInput}
        className="pl-10 bg-background"
        aria-label="Sök produkter"
      />
    </div>
  );
};

export default ProductSearch;
