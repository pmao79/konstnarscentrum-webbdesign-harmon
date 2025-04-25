
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { ShoppingBag } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cleanSupplierName } from '@/utils/productCategorization';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    category: string | null;
    variant_type: string | null;
    price: number;
    image_url: string | null;
    stock_status: number;
    article_number: string;
    supplier: string | null;
    master_product?: any;
    displaySupplier?: string;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { toast } = useToast();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    toast({
      title: "Produkt tillagd",
      description: `${product.name} har lagts till i varukorgen.`,
    });
  };
  
  const getStockStatusText = () => {
    if (product.stock_status <= 0) return "Slut i lager";
    if (product.stock_status < 5) return "Få i lager";
    return "I lager";
  };
  
  const getStockStatusColor = () => {
    if (product.stock_status <= 0) return "text-red-500";
    if (product.stock_status < 5) return "text-amber-500";
    return "text-green-600";
  };

  // Extract brand/supplier name for display
  const displaySupplier = product.displaySupplier || 
    (product.supplier ? cleanSupplierName(product.supplier) : "");
  
  // Extract subcategory/variant_type for display
  const displayCategory = product.variant_type || product.category || "Övrigt";
  
  return (
    <Link to={`/produkter/${product.id}`}>
      <Card className="overflow-hidden card-hover border-art-sand h-full transition-all duration-200 hover:shadow-md">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={product.image_url || '/placeholder.svg'} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between">
            <span className="text-xs text-primary font-medium">{displaySupplier}</span>
            <div className="flex items-center">
              <span className={`text-xs ${getStockStatusColor()}`}>
                {getStockStatusText()}
              </span>
            </div>
          </div>
          {displayCategory && (
            <span className="text-xs text-muted-foreground block mt-1">{displayCategory}</span>
          )}
          <h3 className="font-medium mt-1 mb-1 line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
          <div className="text-xs text-muted-foreground mb-2">Art.nr: {product.article_number}</div>
          <div className="flex justify-between items-center mt-auto">
            <span className="text-lg font-semibold">{product.price} kr</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleAddToCart}
              disabled={product.stock_status <= 0}
              className="h-8"
            >
              <ShoppingBag className="h-4 w-4 mr-1" />
              Köp
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;
