import { supabase } from '@/lib/supabaseClient';
import { Order } from '@/types/order';

export async function getAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        id,
        quantity,
        unit_price,
        product_variant:product_variants(
          id,
          namn,
          artikelnummer
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    throw new Error('Kunde inte hämta ordrar');
  }

  return data || [];
}

export async function getOrderById(id: string): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        id,
        quantity,
        unit_price,
        product_variant:product_variants(
          id,
          namn,
          artikelnummer
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching order:', error);
    throw new Error('Kunde inte hämta order');
  }

  if (!data) {
    throw new Error('Order hittades inte');
  }

  return data;
}

export async function updateOrderStatus(
  id: string,
  status: 'pending' | 'paid' | 'cancelled'
): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Error updating order status:', error);
    throw new Error('Kunde inte uppdatera orderstatus');
  }
} 