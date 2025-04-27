import { PaymentMethod } from './order';

export interface CheckoutFormData {
  email: string;
  phone: string;
  shippingAddress: string;
  paymentMethod: PaymentMethod;
}

export interface CheckoutCartItem {
  product_variant_id: string;
  quantity: number;
  unit_price: number;
  product_name: string;
  product_variant_name: string;
}

export interface CheckoutState {
  items: CheckoutCartItem[];
  total: number;
  loading: boolean;
  error: string | null;
} 