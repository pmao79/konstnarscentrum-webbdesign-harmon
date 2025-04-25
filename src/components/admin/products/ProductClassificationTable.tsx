
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Product = Database["public"]["Tables"]["products"]["Row"];

interface ProductClassificationTableProps {
  products: Product[];
  categories: string[];
  subcategories: string[];
  brands: string[];
  productGroups: string[];
  onProductsUpdated: () => void;
}

const ProductClassificationTable: React.FC<ProductClassificationTableProps> = ({
  products,
  categories,
  subcategories,
  brands,
  productGroups,
  onProductsUpdated
}) => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkEditField, setBulkEditField] = useState<string | null>(null);
  const [bulkEditValue, setBulkEditValue] = useState<string>('');

  // Generic function to update a single product field
  const updateProductField = async (productId: string, field: string, value: string) => {
    try {
      // Map frontend fields to database columns
      const dbFieldMapping: Record<string, string> = {
        'category': 'category',
        'variant_type': 'variant_type', // underkategori
        'supplier': 'supplier', // varumarke
        'variant_name': 'variant_name', // produktgrupp
      };
      
      const dbField = dbFieldMapping[field] || field;

      const { error } = await supabase
        .from('products')
        .update({ [dbField]: value })
        .eq('id', productId);
      
      if (error) throw error;
      
      toast.success(`Uppdaterat ${field} framgångsrikt`);
      onProductsUpdated(); // Refresh data
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(`Kunde inte uppdatera ${field}`);
    }
  };

  // Apply bulk edit to selected products
  const applyBulkEdit = async () => {
    if (!bulkEditField || !bulkEditValue || selectedProducts.length === 0) {
      toast.error("Vänligen välj produkter, ett fält att redigera och ett värde");
      return;
    }

    try {
      // Map frontend fields to database columns
      const dbFieldMapping: Record<string, string> = {
        'category': 'category',
        'variant_type': 'variant_type', // underkategori
        'supplier': 'supplier', // varumarke
        'variant_name': 'variant_name', // produktgrupp
      };
      
      const dbField = dbFieldMapping[bulkEditField] || bulkEditField;

      const { error } = await supabase
        .from('products')
        .update({ [dbField]: bulkEditValue })
        .in('id', selectedProducts);
      
      if (error) throw error;
      
      toast.success(`Uppdaterade ${selectedProducts.length} produkter`);
      setSelectedProducts([]);
      setBulkEditMode(false);
      setBulkEditField(null);
      setBulkEditValue('');
      onProductsUpdated(); // Refresh data
    } catch (error) {
      console.error('Error bulk updating products:', error);
      toast.error("Kunde inte uppdatera produkter");
    }
  };

  // Toggle select all products
  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(product => product.id));
    }
  };

  // Toggle select individual product
  const toggleSelectProduct = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  return (
    <div>
      {/* Bulk edit controls */}
      {selectedProducts.length > 0 && (
        <div className="mb-4 p-3 bg-muted rounded-md">
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium">
              {selectedProducts.length} produkter valda
            </div>
            
            {!bulkEditMode ? (
              <Button 
                size="sm" 
                onClick={() => setBulkEditMode(true)}
              >
                Massredigering
              </Button>
            ) : (
              <div className="flex flex-wrap gap-3 items-center flex-grow">
                <Select 
                  value={bulkEditField || ''} 
                  onValueChange={setBulkEditField}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Välj fält att redigera" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="category">Kategori</SelectItem>
                    <SelectItem value="variant_type">Underkategori</SelectItem>
                    <SelectItem value="supplier">Varumärke</SelectItem>
                    <SelectItem value="variant_name">Produktgrupp</SelectItem>
                  </SelectContent>
                </Select>

                {bulkEditField && (
                  <Select 
                    value={bulkEditValue} 
                    onValueChange={setBulkEditValue}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={`Välj ${bulkEditField}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {bulkEditField === 'category' && categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                      {bulkEditField === 'variant_type' && subcategories.map(subcat => (
                        <SelectItem key={subcat} value={subcat}>{subcat}</SelectItem>
                      ))}
                      {bulkEditField === 'supplier' && brands.map(brand => (
                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                      ))}
                      {bulkEditField === 'variant_name' && productGroups.map(group => (
                        <SelectItem key={group} value={group}>{group}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <div className="flex gap-2">
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={applyBulkEdit} 
                    disabled={!bulkEditField || !bulkEditValue}
                  >
                    Använd på {selectedProducts.length} produkter
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setBulkEditMode(false);
                      setBulkEditField(null);
                      setBulkEditValue('');
                    }}
                  >
                    Avbryt
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Products table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={products.length > 0 && selectedProducts.length === products.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Artikelnr</TableHead>
              <TableHead>Benämning</TableHead>
              <TableHead>Varumärke</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Underkategori</TableHead>
              <TableHead>Produktgrupp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  Inga produkter hittades
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => toggleSelectProduct(product.id)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{product.article_number}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>
                    <Select 
                      value={product.supplier || ''}
                      onValueChange={(value) => updateProductField(product.id, 'supplier', value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Välj varumärke" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map(brand => (
                          <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={product.category || ''}
                      onValueChange={(value) => updateProductField(product.id, 'category', value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Välj kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={product.variant_type || ''}
                      onValueChange={(value) => updateProductField(product.id, 'variant_type', value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Välj underkategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {subcategories.map(subcategory => (
                          <SelectItem key={subcategory} value={subcategory}>{subcategory}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={product.variant_name || ''}
                      onValueChange={(value) => updateProductField(product.id, 'variant_name', value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Välj produktgrupp" />
                      </SelectTrigger>
                      <SelectContent>
                        {productGroups.map(group => (
                          <SelectItem key={group} value={group}>{group}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProductClassificationTable;
