import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProductSortProps {
  sortBy: string;
  onSortChange: (value: string) => void;
}

export function ProductSort({ sortBy, onSortChange }: ProductSortProps) {
  return (
    <Select value={sortBy} onValueChange={onSortChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sortera efter" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="name-asc">Namn (A-Ö)</SelectItem>
        <SelectItem value="name-desc">Namn (Ö-A)</SelectItem>
        <SelectItem value="price-asc">Pris (Lågt till högt)</SelectItem>
        <SelectItem value="price-desc">Pris (Högt till lågt)</SelectItem>
        <SelectItem value="newest">Nyast först</SelectItem>
        <SelectItem value="oldest">Äldst först</SelectItem>
      </SelectContent>
    </Select>
  );
}
