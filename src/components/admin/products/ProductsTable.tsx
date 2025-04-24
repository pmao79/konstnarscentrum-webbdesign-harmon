
import React from 'react';
import { Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

interface ProductsTableProps {
  products: Product[];
}

const ProductsTable: React.FC<ProductsTableProps> = ({ products }) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Artikelnr</TableHead>
            <TableHead>Namn</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead className="text-right">Pris</TableHead>
            <TableHead className="text-right">Lager</TableHead>
            <TableHead className="text-center">Åtgärder</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className="group">
              <TableCell className="font-mono">{product.article_number}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  {product.image_url && (
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="h-8 w-8 rounded object-cover"
                    />
                  )}
                  <div>
                    <div className="font-medium">{product.name}</div>
                    {product.variant_name && (
                      <div className="text-sm text-muted-foreground">
                        Variant: {product.variant_name}
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {product.category ? (
                  <Badge variant="outline">{product.category}</Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">
                    Okategoriserad
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right">{product.price} kr</TableCell>
              <TableCell className="text-right">
                <Badge 
                  variant={product.stock_status > 10 ? "default" : 
                          product.stock_status > 0 ? "outline" : 
                          "destructive"}
                >
                  {product.stock_status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-center gap-2">
                  <Button size="icon" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductsTable;
