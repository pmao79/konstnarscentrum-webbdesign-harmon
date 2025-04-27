import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

const checkoutSchema = z.object({
  namn: z.string().min(1, 'Namn är obligatoriskt'),
  email: z.string().email('Ogiltig e-postadress'),
  telefon: z.string().min(1, 'Telefonnummer är obligatoriskt'),
  adress: z.string().min(1, 'Adress är obligatorisk'),
  postnummer: z.string().min(1, 'Postnummer är obligatoriskt'),
  stad: z.string().min(1, 'Stad är obligatorisk'),
  land: z.string().min(1, 'Land är obligatoriskt'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      land: 'Sverige',
    },
  });

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          items: cart,
          totalAmount: totalPrice,
        }),
      });

      if (!response.ok) {
        throw new Error('Kunde inte skapa ordern');
      }

      clearCart();
      toast.success('Tack för din order!');
      navigate('/orderbekraftelse');
    } catch (error) {
      toast.error('Ett fel uppstod när ordern skulle skapas');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Kassan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              Din varukorg är tom. Lägg till produkter för att fortsätta till kassan.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kunduppgifter */}
          <Card>
            <CardHeader>
              <CardTitle>Kunduppgifter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="namn">Namn</Label>
                <Input
                  id="namn"
                  {...register('namn')}
                  placeholder="För- och efternamn"
                />
                {errors.namn && (
                  <p className="text-sm text-destructive">{errors.namn.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-postadress</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="din@epost.se"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefon">Telefonnummer</Label>
                <Input
                  id="telefon"
                  {...register('telefon')}
                  placeholder="070-123 45 67"
                />
                {errors.telefon && (
                  <p className="text-sm text-destructive">{errors.telefon.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Leveransadress */}
          <Card>
            <CardHeader>
              <CardTitle>Leveransadress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adress">Adress</Label>
                <Input
                  id="adress"
                  {...register('adress')}
                  placeholder="Gatunamn 123"
                />
                {errors.adress && (
                  <p className="text-sm text-destructive">{errors.adress.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postnummer">Postnummer</Label>
                  <Input
                    id="postnummer"
                    {...register('postnummer')}
                    placeholder="123 45"
                  />
                  {errors.postnummer && (
                    <p className="text-sm text-destructive">{errors.postnummer.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stad">Stad</Label>
                  <Input
                    id="stad"
                    {...register('stad')}
                    placeholder="Stad"
                  />
                  {errors.stad && (
                    <p className="text-sm text-destructive">{errors.stad.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="land">Land</Label>
                <Input
                  id="land"
                  {...register('land')}
                  placeholder="Land"
                />
                {errors.land && (
                  <p className="text-sm text-destructive">{errors.land.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orderöversikt */}
        <Card>
          <CardHeader>
            <CardTitle>Orderöversikt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.map((item) => (
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
            <Separator />
            <div className="flex justify-between items-center">
              <p className="font-medium">Totalt</p>
              <p className="text-lg font-bold">{formatCurrency(totalPrice)}</p>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Skapar order...' : 'Slutför köp'}
        </Button>
      </form>
    </div>
  );
} 