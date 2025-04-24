
import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash, ChevronRight, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MasterProductListProps {
  masterProducts: any[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const MasterProductList: React.FC<MasterProductListProps> = ({
  masterProducts,
  onEdit,
  onDelete
}) => {
  const [expandedProducts, setExpandedProducts] = React.useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedProducts(newExpanded);
  };

  return (
    <div className="space-y-4">
      {masterProducts.map((master) => (
        <Card key={master.id} className="overflow-hidden">
          <div 
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
            onClick={() => toggleExpand(master.id)}
          >
            <div className="flex items-center gap-2">
              {expandedProducts.has(master.id) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <h3 className="font-medium">{master.name}</h3>
              <Badge variant="outline">{master.products?.length || 0} varianter</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {master.base_price} kr
              </span>
              <Button size="icon" variant="ghost" onClick={(e) => {
                e.stopPropagation();
                onEdit(master.id);
              }}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={(e) => {
                e.stopPropagation();
                onDelete(master.id);
              }}>
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {expandedProducts.has(master.id) && (
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Artikelnr</TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead className="text-right">Lager</TableHead>
                    <TableHead className="text-center">Åtgärder</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {master.products?.map((variant: any) => (
                    <TableRow key={variant.id}>
                      <TableCell className="font-mono">
                        {variant.article_number}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {variant.image_url && (
                            <img 
                              src={variant.image_url} 
                              alt={variant.variant_name} 
                              className="h-8 w-8 rounded object-cover"
                            />
                          )}
                          <span>{variant.variant_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge 
                          variant={variant.stock_status > 10 ? "default" : 
                                  variant.stock_status > 0 ? "outline" : 
                                  "destructive"}
                        >
                          {variant.stock_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button size="icon" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};

export default MasterProductList;
