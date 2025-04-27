import { supabase } from '@/lib/supabaseClient';
import { CartItem } from '@/types/cart';

interface CreateOrderData {
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  customerPostcode: string;
  customerCity: string;
  customerCountry: string;
  items: CartItem[];
  totalAmount: number;
}

export async function createOrder(orderData: CreateOrderData) {
  const { error } = await supabase.from('orders').insert([
    {
      customer_name: orderData.customerName,
      customer_email: orderData.customerEmail,
      customer_address: orderData.customerAddress,
      customer_postcode: orderData.customerPostcode,
      customer_city: orderData.customerCity,
      customer_country: orderData.customerCountry,
      total_amount: orderData.totalAmount,
      items: orderData.items,
    },
  ]);

  if (error) {
    throw new Error('Det gick inte att skapa ordern.');
  }
} 