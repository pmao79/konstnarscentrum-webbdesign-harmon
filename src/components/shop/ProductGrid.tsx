
import ProductCard from "@/components/ProductCard";
import { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

interface ProductGridProps {
  products: Product[] | null;
  isLoading: boolean;
  error: Error | null;
}

const ProductGrid = ({ products, isLoading, error }: ProductGridProps) => {
  if (isLoading) {
    return <div>Laddar produkter...</div>;
  }

  if (error) {
    return <div>Ett fel uppstod när produkterna skulle laddas.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products?.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
