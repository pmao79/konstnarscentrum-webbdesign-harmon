export interface DailySales {
  date: string;
  amount: number;
}

export interface DashboardStats {
  orders_today: number;
  sales_today: number;
  orders_this_week: number;
  sales_this_week: number;
  daily_sales: DailySales[];
} 