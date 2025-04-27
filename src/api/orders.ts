import { supabase } from '@/lib/supabaseClient';
import { Order, OrderItem, CreateOrderRequest, OrderStatistics } from '@/types/order';

// Skapa en ny order
export async function createOrder(orderData: CreateOrderRequest): Promise<Order> {
  try {
    // Beräkna totalbelopp
    const total_amount = orderData.items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );

    // Skapa order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        total_amount,
        customer_email: orderData.customer_email,
        customer_phone: orderData.customer_phone,
        shipping_address: orderData.shipping_address,
        payment_method: orderData.payment_method,
      })
      .select()
      .single();

    if (orderError) throw orderError;
    if (!order) throw new Error('Kunde inte skapa order');

    // Skapa order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_variant_id: item.product_variant_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return order;
  } catch (err) {
    console.error('Fel vid skapande av order:', err);
    throw err;
  }
}

// Hämta alla ordrar
export async function getOrders(): Promise<Order[]> {
  try {
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product_variant:produktvarianter(
            id,
            namn,
            artikelnummer
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (ordersError) throw ordersError;
    return orders || [];
  } catch (err) {
    console.error('Fel vid hämtning av ordrar:', err);
    throw err;
  }
}

// Hämta en specifik order
export async function getOrderById(id: string): Promise<Order> {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product_variant:produktvarianter(
            id,
            namn,
            artikelnummer
          )
        )
      `)
      .eq('id', id)
      .single();

    if (orderError) throw orderError;
    if (!order) throw new Error('Order hittades inte');

    return order;
  } catch (err) {
    console.error('Fel vid hämtning av order:', err);
    throw err;
  }
}

// Hämta orderstatistik
export async function getOrderStatistics(): Promise<OrderStatistics> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - today.getDay());

    // Hämta ordrar idag
    const { data: todayOrders, error: todayError } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', today.toISOString());

    if (todayError) throw todayError;

    // Hämta månadsomsättning
    const { data: monthlyOrders, error: monthlyError } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', firstDayOfMonth.toISOString());

    if (monthlyError) throw monthlyError;

    // Hämta veckoförsäljning
    const { data: weeklyOrders, error: weeklyError } = await supabase
      .from('orders')
      .select('created_at, total_amount')
      .gte('created_at', firstDayOfWeek.toISOString())
      .order('created_at');

    if (weeklyError) throw weeklyError;

    // Beräkna statistik
    const orders_today = todayOrders?.length || 0;
    const sales_today = todayOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
    const monthly_revenue = monthlyOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

    // Gruppera veckoförsäljning
    const weekly_sales = weeklyOrders?.reduce((acc, order) => {
      const date = new Date(order.created_at);
      const weekNumber = Math.ceil((date.getDate() + date.getDay()) / 7);
      const week = `${date.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
      
      if (!acc[week]) {
        acc[week] = 0;
      }
      acc[week] += order.total_amount;
      
      return acc;
    }, {} as Record<string, number>) || {};

    return {
      orders_today,
      sales_today,
      monthly_revenue,
      weekly_sales: Object.entries(weekly_sales).map(([week, amount]) => ({
        week,
        amount
      }))
    };
  } catch (err) {
    console.error('Fel vid hämtning av statistik:', err);
    throw err;
  }
} 