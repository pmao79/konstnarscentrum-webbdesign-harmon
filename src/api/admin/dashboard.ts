import { supabase } from '@/lib/supabaseClient';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface DailySales {
  date: string;
  amount: number;
}

interface DashboardStats {
  orders_today: number;
  sales_today: number;
  orders_this_week: number;
  sales_this_week: number;
  daily_sales: DailySales[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = new Date();
  const weekAgo = subDays(today, 7);

  // Hämta dagens ordrar och försäljning
  const { data: todayData, error: todayError } = await supabase
    .from('orders')
    .select('id, total_amount, created_at')
    .gte('created_at', startOfDay(today).toISOString())
    .lte('created_at', endOfDay(today).toISOString());

  if (todayError) {
    console.error('Error fetching today stats:', todayError);
    throw new Error('Kunde inte hämta dagens statistik');
  }

  // Hämta veckans ordrar och försäljning
  const { data: weekData, error: weekError } = await supabase
    .from('orders')
    .select('id, total_amount, created_at')
    .gte('created_at', startOfDay(weekAgo).toISOString())
    .lte('created_at', endOfDay(today).toISOString());

  if (weekError) {
    console.error('Error fetching week stats:', weekError);
    throw new Error('Kunde inte hämta veckans statistik');
  }

  // Beräkna daglig försäljning
  const dailySalesMap = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    dailySalesMap.set(dateStr, 0);
  }

  weekData?.forEach((order) => {
    const dateStr = format(new Date(order.created_at), 'yyyy-MM-dd');
    const currentAmount = dailySalesMap.get(dateStr) || 0;
    dailySalesMap.set(dateStr, currentAmount + order.total_amount);
  });

  const dailySales: DailySales[] = Array.from(dailySalesMap.entries())
    .map(([date, amount]) => ({
      date,
      amount
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    orders_today: todayData?.length || 0,
    sales_today: todayData?.reduce((sum, order) => sum + order.total_amount, 0) || 0,
    orders_this_week: weekData?.length || 0,
    sales_this_week: weekData?.reduce((sum, order) => sum + order.total_amount, 0) || 0,
    daily_sales
  };
} 