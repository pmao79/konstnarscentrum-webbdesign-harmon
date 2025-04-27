import React, { useEffect, useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { supabase } from "@/integrations/supabase/client";
import ProductImporter from '@/components/admin/ProductImporter';
import ImportHistory from '@/components/admin/ImportHistory';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Loader2, ShoppingCart, TrendingUp, Calendar, BarChart } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { getDashboardStats } from '@/api/admin/dashboard';
import { DashboardStats } from '@/types/dashboard';

interface ProductStats {
  totalCount: number;
  categories: Record<string, number>;
}

const Dashboard = () => {
  const [productStats, setProductStats] = useState<ProductStats>({ totalCount: 0, categories: {} });
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    async function fetchStats() {
      try {
        const statsData = await getDashboardStats();
        setStats(statsData);
      } catch (err) {
        setError('Kunde inte hämta statistik');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500">{error || 'Kunde inte ladda statistik'}</div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('sv-SE', {
      style: 'currency',
      currency: 'SEK'
    });
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'd MMM', { locale: sv });
  };

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-muted/10">
        {/* Admin Sidebar */}
        <AdminSidebar />
        
        {/* Main Content */}
        <SidebarInset>
          <div className="container px-4 py-8 md:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-serif mb-1">Admin Dashboard</h1>
              <p className="text-muted-foreground">Hantera din konstbutik</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
              <Card className="p-6">
                <h3 className="font-medium mb-1">Produkter</h3>
                <p className="text-3xl font-bold">{isLoading ? '...' : productStats.totalCount}</p>
                <p className="text-sm text-muted-foreground">Totalt antal produkter</p>
              </Card>
              
              <Card className="p-6">
                <h3 className="font-medium mb-1">Kategorier</h3>
                <p className="text-3xl font-bold">
                  {isLoading ? '...' : Object.keys(productStats.categories).length}
                </p>
                <p className="text-sm text-muted-foreground">Produktkategorier</p>
              </Card>
              
              <Card className="p-6">
                <h3 className="font-medium mb-1">Ordrar</h3>
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Nya ordrar</p>
              </Card>
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

            {/* Statistik kort */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Dagens ordrar</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.orders_today}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Dagens omsättning</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.sales_today)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ordrar senaste 7 dagarna</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.orders_this_week}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Omsättning senaste 7 dagarna</CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.sales_this_week)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Försäljningsgraf */}
            <Card>
              <CardHeader>
                <CardTitle>Daglig omsättning senaste veckan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={stats.daily_sales}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatDate}
                      />
                      <YAxis
                        tickFormatter={(value) => formatCurrency(value)}
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={formatDate}
                      />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
