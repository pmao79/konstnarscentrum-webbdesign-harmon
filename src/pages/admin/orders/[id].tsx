import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getOrderById, updateOrderStatus } from '@/api/admin/orders';
import { Order } from '@/types/order';

export default function AdminOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      if (!id) {
        setError('Ingen order angiven');
        setLoading(false);
        return;
      }

      try {
        const orderData = await getOrderById(id);
        setOrder(orderData);
      } catch (err) {
        setError('Kunde inte hämta orderinformation');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async (newStatus: 'paid' | 'cancelled') => {
    if (!id || !order) return;

    try {
      setUpdating(true);
      await updateOrderStatus(id, newStatus);
      setOrder({ ...order, status: newStatus });
      toast.success(`Orderstatus uppdaterad till ${newStatus === 'paid' ? 'Betald' : 'Avbruten'}`);
    } catch (err) {
      toast.error('Kunde inte uppdatera orderstatus');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default">Betald</Badge>;
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

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500">{error || 'Order hittades inte'}</div>
        <Button
          onClick={() => navigate('/admin/orders')}
          className="mt-4"
        >
          Tillbaka till orderlista
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Order #{order.id}</h1>
          <div className="flex items-center gap-2">
            <span className="font-medium">Status:</span>
            {getStatusBadge(order.status)}
          </div>
        </div>

        <div className="grid gap-6">
          {/* Kundinformation */}
          <Card>
            <CardHeader>
              <CardTitle>Kundinformation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><span className="font-medium">E-post:</span> {order.customer_email}</p>
                {order.customer_phone && (
                  <p><span className="font-medium">Telefon:</span> {order.customer_phone}</p>
                )}
                <p><span className="font-medium">Leveransadress:</span> {order.shipping_address}</p>
              </div>
            </CardContent>
          </Card>

          {/* Orderinformation */}
          <Card>
            <CardHeader>
              <CardTitle>Orderinformation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p><span className="font-medium">Orderdatum:</span> {format(new Date(order.created_at), 'PPP', { locale: sv })}</p>
                  <p><span className="font-medium">Betalningsmetod:</span> {order.payment_method}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Produkter</h3>
                  <div className="space-y-2">
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center py-2 border-b"
                      >
                        <div>
                          <p className="font-medium">{item.product_variant?.namn}</p>
                          <p className="text-sm text-gray-500">{item.quantity} st</p>
                        </div>
                        <p>
                          {(item.unit_price * item.quantity).toLocaleString('sv-SE', {
                            style: 'currency',
                            currency: 'SEK'
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Totalt:</span>
                    <span>
                      {order.total_amount.toLocaleString('sv-SE', {
                        style: 'currency',
                        currency: 'SEK'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statusuppdatering */}
          {order.status === 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle>Uppdatera orderstatus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button
                    onClick={() => handleStatusUpdate('paid')}
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uppdaterar...
                      </>
                    ) : (
                      'Markera som Betald'
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleStatusUpdate('cancelled')}
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uppdaterar...
                      </>
                    ) : (
                      'Markera som Avbruten'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-8">
          <Button
            onClick={() => navigate('/admin/orders')}
            variant="outline"
          >
            Tillbaka till orderlista
          </Button>
        </div>
      </div>
    </div>
  );
} 