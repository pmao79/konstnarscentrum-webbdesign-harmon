import { Product } from '@/types/product';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.namn,
      price: product.pris,
      quantity: 1,
      imageUrl: product.bildUrl,
    });
  };

  return (
    <Card className="overflow-hidden">
      <div 
        className="aspect-square relative cursor-pointer" 
        onClick={() => navigate(`/produkt/${product.id}`)}
      >
        <img
          src={product.bildUrl || '/placeholder.png'}
          alt={product.namn}
          className="object-cover w-full h-full"
        />
      </div>
      <CardHeader className="p-4">
        <h3 className="font-medium text-lg">{product.namn}</h3>
        <p className="text-muted-foreground">{product.varumärke?.namn}</p>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-2xl font-bold">{product.pris} kr</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full" 
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Lägg i kundvagn
        </Button>
      </CardFooter>
    </Card>
  );
} 