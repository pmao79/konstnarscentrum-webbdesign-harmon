import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Database } from "@/integrations/supabase/types";
import { Button } from '@/components/ui/button';
import ProductsTable from '@/components/admin/products/ProductsTable';
import ProductFilters from '@/components/admin/products/ProductFilters';
import ProductStats from '@/components/admin/products/ProductStats';

type Product = Database["public"]["Tables"]["products"]["Row"];

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [suppliers, setSuppliers] = useState<string[]>([ ]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [groupedView, setGroupedView] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        let { data: masterProducts, error: masterError } = await supabase
          .from('master_products')
          .select(`
            *,
            products:products(*)
          `)
          .order('name', { ascending: true });
        
        if (masterError) throw masterError;
        
        const { data: standaloneProducts, error: productsError } = await supabase
          .from('products')
          .select('*')
          .is('master_product_id', null)
          .order('name', { ascending: true });
          
        if (productsError) throw productsError;
        
        setProducts(standaloneProducts || []);
        setFilteredProducts(standaloneProducts || []);
        
        const allProducts = [
          ...(standaloneProducts || []),
          ...masterProducts?.flatMap(mp => mp.products) || []
        ];
        
        const uniqueCategories = Array.from(new Set(
          allProducts.map(product => product.category || 'Okategoriserad')
            .filter(Boolean)
        )).sort();
        
        const uniqueSuppliers = Array.from(new Set(
          allProducts.map(product => product.supplier || 'Okänd')
            .filter(Boolean)
        )).sort();
        
        setCategories(uniqueCategories as string[]);
        setSuppliers(uniqueSuppliers as string[]);
        
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = [...products];
    
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchLower) || 
        product.article_number.toLowerCase().includes(searchLower) ||
        (product.description || '').toLowerCase().includes(searchLower)
      );
    }
    
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(product => 
        product.category === selectedCategory
      );
    }
    
    if (selectedSupplier && selectedSupplier !== 'all') {
      result = result.filter(product => 
        product.supplier === selectedSupplier
      );
    }
    
    result.sort((a, b) => {
      let comparison = 0;
      
      switch(sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'article_number':
          comparison = a.article_number.localeCompare(b.article_number);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'stock':
          comparison = a.stock_status - b.stock_status;
          break;
        case 'category':
          comparison = (a.category || '').localeCompare(b.category || '');
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredProducts(result);
  }, [products, search, sortBy, sortDirection, selectedCategory, selectedSupplier]);
  
  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedSupplier('all');
    setSortBy('name');
    setSortDirection('asc');
  };

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-muted/10">
        <AdminSidebar />
        
        <SidebarInset>
          <div className="container px-4 py-8 md:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-serif mb-1">Produkter</h1>
              <p className="text-muted-foreground">Hantera ditt produktsortiment</p>
            </div>
            
            <Card className="mb-6">
              <CardContent className="p-4">
                <ProductFilters 
                  search={search}
                  onSearchChange={setSearch}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  selectedSupplier={selectedSupplier}
                  onSupplierChange={setSelectedSupplier}
                  categories={categories}
                  suppliers={suppliers}
                  onResetFilters={resetFilters}
                />
              </CardContent>
            </Card>
            
            <ProductStats 
              filteredCount={filteredProducts.length}
              totalCount={products.length}
              groupedView={groupedView}
              onToggleView={() => setGroupedView(!groupedView)}
            />

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Produktlista</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <ProductsTable products={filteredProducts} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p>Inga produkter matchade filtret</p>
                    <Button variant="link" onClick={resetFilters}>
                      Återställ filter
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminProducts;
