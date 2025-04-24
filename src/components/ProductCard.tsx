
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Star } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    category: string | null;
    price: number;
    image_url: string | null;
    stock_status: number;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Card className="overflow-hidden card-hover border-art-sand">
      <div className="h-48 relative">
        <img 
          src={product.image_url || '/placeholder.svg'} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between">
          <span className="text-xs text-primary font-medium">{product.category}</span>
          <div className="flex items-center">
            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs ml-1">{product.stock_status > 0 ? 'I lager' : 'Slut i lager'}</span>
          </div>
        </div>
        <h3 className="font-medium mt-1 mb-2">{product.name}</h3>
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">{product.price} kr</span>
          <Button variant="ghost" size="sm" disabled={product.stock_status <= 0}>
            <ShoppingBag className="h-4 w-4 mr-1" />
            Köp
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
