'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { API_URL } from '../lib/api';

type CartItem = { id: string; title: string; price: number };

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: number;
};

const CartContext = createContext<CartContextType | null>(null);

const localKey = (userId: string) => `ag-cursos-cart-${userId}`;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  // Al cambiar de sesión: carga el carrito desde la BD (o localStorage como fallback)
  useEffect(() => {
    if (!user || !token) {
      setItems([]);
      return;
    }
    fetch('${API_URL}/cart', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const mapped: CartItem[] = data.map((ci: any) => ({
            id: ci.course.id,
            title: ci.course.title,
            price: ci.course.price,
          }));
          setItems(mapped);
          localStorage.setItem(localKey(user.id), JSON.stringify(mapped));
        }
      })
      .catch(() => {
        const stored = localStorage.getItem(localKey(user.id));
        if (stored) setItems(JSON.parse(stored));
      });
  }, [user?.id, token]);

  const syncLocal = (newItems: CartItem[]) => {
    if (user) localStorage.setItem(localKey(user.id), JSON.stringify(newItems));
  };

  const addItem = (item: CartItem) => {
    if (items.find(i => i.id === item.id)) return;
    const newItems = [...items, item];
    setItems(newItems);
    syncLocal(newItems);
    if (token) {
      fetch('${API_URL}/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ courseId: item.id }),
      }).catch(() => {});
    }
  };

  const removeItem = (id: string) => {
    const newItems = items.filter(i => i.id !== id);
    setItems(newItems);
    syncLocal(newItems);
    if (token) {
      fetch(`${API_URL}/cart/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  };

  const clearCart = () => {
    setItems([]);
    if (user) localStorage.setItem(localKey(user.id), JSON.stringify([]));
    if (token) {
      fetch('${API_URL}/cart/clear', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  };

  const total = items.reduce((sum, i) => sum + i.price, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}
