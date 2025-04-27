import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAllOrders } from '@/api/admin/orders';
import { Order } from '@/types/order';

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const ordersData = await getAllOrders();
        setOrders(ordersData);
      } catch (err) {
        setError('Kunde inte hämta ordrar');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Betald</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Avbruten</Badge>;
      default:
        return <Badge variant="secondary">Obekräftad</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Ordrar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4">Ordernummer</th>
                  <th className="text-left py-4 px-4">Datum</th>
                  <th className="text-left py-4 px-4">Kund</th>
                  <th className="text-left py-4 px-4">Totalt</th>
                  <th className="text-left py-4 px-4">Status</th>
                  <th className="text-left py-4 px-4">Åtgärder</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">{order.id}</td>
                    <td className="py-4 px-4">
                      {format(new Date(order.created_at), 'PPP', { locale: sv })}
                    </td>
                    <td className="py-4 px-4">{order.customer_email}</td>
                    <td className="py-4 px-4">
                      {order.total_amount.toLocaleString('sv-SE', {
                        style: 'currency',
                        currency: 'SEK'
                      })}
                    </td>
                    <td className="py-4 px-4">{getStatusBadge(order.status)}</td>
                    <td className="py-4 px-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                      >
                        Visa detaljer
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 