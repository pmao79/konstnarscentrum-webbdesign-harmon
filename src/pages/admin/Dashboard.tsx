
import React, { useEffect, useState } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarTrigger,
  SidebarInset
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ProductImporter from '@/components/admin/ProductImporter';
import ImportHistory from '@/components/admin/ImportHistory';

interface ProductStats {
  totalCount: number;
  categories: Record<string, number>;
}

const Dashboard = () => {
  const [productStats, setProductStats] = useState<ProductStats>({ totalCount: 0, categories: {} });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProductStats = async () => {
      try {
        // Get total count
        const { count, error: countError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
          
        if (countError) throw countError;
        
        // Get categories with counts
        const { data: categoryData, error: catError } = await supabase
          .from('products')
          .select('category');
          
        if (catError) throw catError;
        
        // Calculate category counts
        const categories: Record<string, number> = {};
        categoryData.forEach(item => {
          const category = item.category || 'Okategoriserad';
          categories[category] = (categories[category] || 0) + 1;
        });
        
        setProductStats({
          totalCount: count || 0,
          categories
        });
      } catch (error) {
        console.error('Error fetching product stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProductStats();
  }, []);

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen bg-muted/10">
        {/* Admin Sidebar */}
        <Sidebar>
          <SidebarContent className="p-0">
            <div className="h-16 border-b bg-background px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SidebarTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SidebarTrigger>
                <span className="text-lg font-medium">SKC Admin</span>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <div className="space-y-2 p-2">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href="/admin">Dashboard</a>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href="/admin/products">Produkter</a>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href="/admin/orders">Ordrar</a>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href="/admin/customers">Kunder</a>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href="/admin/settings">Inställningar</a>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href="/">Tillbaka till butiken</a>
                </Button>
              </div>
            </div>
          </SidebarContent>
        </Sidebar>
        
        {/* Main Content */}
        <SidebarInset>
          <div className="container px-4 py-8 md:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-serif mb-1">Admin Dashboard</h1>
              <p className="text-muted-foreground">Hantera din konstbutik</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
              <div className="p-6 bg-background rounded-lg border shadow-sm">
                <h3 className="font-medium mb-1">Produkter</h3>
                <p className="text-3xl font-bold">{isLoading ? '...' : productStats.totalCount}</p>
                <p className="text-sm text-muted-foreground">Totalt antal produkter</p>
              </div>
              
              <div className="p-6 bg-background rounded-lg border shadow-sm">
                <h3 className="font-medium mb-1">Kategorier</h3>
                <p className="text-3xl font-bold">
                  {isLoading ? '...' : Object.keys(productStats.categories).length}
                </p>
                <p className="text-sm text-muted-foreground">Produktkategorier</p>
              </div>
              
              <div className="p-6 bg-background rounded-lg border shadow-sm">
                <h3 className="font-medium mb-1">Ordrar</h3>
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Nya ordrar</p>
              </div>
            </div>

            <Tabs defaultValue="import" className="mb-8">
              <TabsList>
                <TabsTrigger value="import">Produktimport</TabsTrigger>
                <TabsTrigger value="history">Importhistorik</TabsTrigger>
              </TabsList>
              <TabsContent value="import" className="pt-4">
                <ProductImporter />
              </TabsContent>
              <TabsContent value="history" className="pt-4">
                <ImportHistory />
              </TabsContent>
            </Tabs>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
