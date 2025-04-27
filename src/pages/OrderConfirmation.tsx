import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface OrderItem {
  id: string;
  namn: string;
  quantity: number;
  pris: number;
}

interface OrderData {
  id: string;
  items: OrderItem[];
  totalAmount: number;
  customerName: string;
  customerEmail: string;
}

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state as OrderData | undefined;

  useEffect(() => {
    if (!orderData) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [navigate, orderData]);

  if (!orderData) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Ingen order hittades</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              Omdirigerar till startsidan...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Tack för din order!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            Vi har mottagit din beställning och skickar en bekräftelse till din e-post.
          </p>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Ordernummer:</span>
              <span className="font-medium">{orderData.id}</span>
            </div>

            <Separator />

            <div className="space-y-4">
              {orderData.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.namn}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} st × {formatCurrency(item.pris)}
                    </p>
                  </div>
                  <p className="font-medium">
                    {formatCurrency(item.pris * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="font-medium">Totalt att betala:</span>
              <span className="text-lg font-bold">
                {formatCurrency(orderData.totalAmount)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/produkter')}
            >
              Fortsätt handla
            </Button>
            <Button
              className="w-full"
              onClick={() => navigate('/')}
            >
              Till startsidan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 