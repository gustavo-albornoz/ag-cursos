'use client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

type Props = { id: string; title: string; price: number };

export default function AddToCartButton({ id, title, price }: Props) {
  const { addItem, items } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  if (user?.isProfesor || user?.isAdmin) return null;

  const inCart = items.some(i => i.id === id);

  if (inCart) {
    return (
      <button
        onClick={() => router.push('/carrito')}
        className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition w-full md:w-auto"
      >
        Ir al carrito →
      </button>
    );
  }

  return (
    <button
      onClick={() => addItem({ id, title, price })}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition w-full md:w-auto"
    >
      Agregar al carrito
    </button>
  );
}
