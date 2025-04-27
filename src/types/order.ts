export type OrderStatus = 'pending' | 'paid' | 'cancelled';
export type PaymentMethod = 'Swish' | 'Klarna' | 'Kort';

export interface OrderItem {
  id: string;
  order_id: string;
  product_variant_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
  product_variant?: {
    id: string;
    namn: string;
    artikelnummer: string;
  };
}

export interface Order {
  id: string;
  created_at: string;
  updated_at: string;
  order_status: OrderStatus;
  total_amount: number;
  customer_email: string;
  customer_phone?: string;
  shipping_address: string;
  payment_method: PaymentMethod;
  status: OrderStatus;
  items?: OrderItem[];
}

export interface CreateOrderRequest {
  customer_email: string;
  customer_phone?: string;
  shipping_address: string;
  payment_method: PaymentMethod;
  items: {
    product_variant_id: string;
    quantity: number;
    unit_price: number;
  }[];
}

export interface OrderStatistics {
  orders_today: number;
  sales_today: number;
  monthly_revenue: number;
  weekly_sales: {
    week: string;
    amount: number;
  }[];
} 