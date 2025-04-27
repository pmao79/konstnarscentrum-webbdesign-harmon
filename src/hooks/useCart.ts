import { useState, useEffect } from 'react';
import { Product } from '@/types/product';

export interface CartItem extends Product {
  quantity: number;
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  function addToCart(product: Product) {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }

  function removeFromCart(productId: string) {
    setCart(prev => prev.filter(item => item.id !== productId));
  }

  function clearCart() {
    setCart([]);
  }

  function updateQuantity(productId: string, quantity: number) {
    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.quantity * item.pris, 0);

  return {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    updateQuantity,
    totalItems,
    totalPrice,
  };
} 