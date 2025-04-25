
import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Loader2, Search, FilterX } from 'lucide-react';
import ProductClassificationTable from '@/components/admin/products/ProductClassificationTable';
import { useProductsAdmin } from '@/hooks/useProductsAdmin';

const ProductClassification = () => {
  const {
    products,
    filteredProducts,
    isLoading,
    search,
    setSearch,
    selectedBrand,
    setSelectedBrand,
    selectedCategory,
    setSelectedCategory,
    selectedSubcategory,
    setSelectedSubcategory,
    selectedProductGroup,
    setSelectedProductGroup,
    resetFilters,
    categories,
    subcategories,
    brands,
    productGroups,
    refreshProducts
  } = useProductsAdmin();

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-muted/10">
        <AdminSidebar />
        
        <SidebarInset>
          <div className="container px-4 py-8 md:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-serif mb-1">Produktklassificering</h1>
              <p className="text-muted-foreground">Klassificera produkter för bättre kategorisering och filtrering</p>
            </div>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl">Filtrera produkter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 md:flex-row md:items-end">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Sök efter artikelnummer, namn eller beskrivning..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alla kategorier</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Underkategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alla underkategorier</SelectItem>
                        {subcategories.map(subcategory => (
                          <SelectItem key={subcategory} value={subcategory}>{subcategory}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                      <SelectTrigger>
                        <SelectValue placeholder="Varumärke" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alla varumärken</SelectItem>
                        {brands.map(brand => (
                          <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={resetFilters}
                    >
                      <FilterX className="h-4 w-4" />
                      Rensa filter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Produkter ({filteredProducts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <ProductClassificationTable
                    products={filteredProducts}
                    categories={categories}
                    subcategories={subcategories}
                    brands={brands}
                    productGroups={productGroups}
                    onProductsUpdated={refreshProducts}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ProductClassification;
