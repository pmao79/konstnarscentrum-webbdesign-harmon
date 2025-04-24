
import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import ProductsTable from '@/components/admin/products/ProductsTable';
import ProductFilters from '@/components/admin/products/ProductFilters';
import ProductStats from '@/components/admin/products/ProductStats';
import { useProductsAdmin } from '@/hooks/useProductsAdmin';
import { Button } from '@/components/ui/button';

const AdminProducts = () => {
  const {
    filteredProducts,
    products,
    isLoading,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    selectedSupplier,
    setSelectedSupplier,
    categories,
    suppliers,
    groupedView,
    setGroupedView,
    resetFilters
  } = useProductsAdmin();

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
