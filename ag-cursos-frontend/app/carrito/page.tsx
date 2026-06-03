'use client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';


export default function CarritoPage() {
  const { items, removeItem, clearCart, total } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setLoading(true);
    setError('');

    try {
      for (const item of items) {
        const res = await fetch('http://localhost:3000/checkout/mock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, courseId: item.id }),
        });
        if (!res.ok) throw new Error(`Error al procesar "${item.title}"`);
      }

      clearCart();
      router.push('/mis-cursos');
    } catch (e: any) {
      setError(e.message || 'Ocurrió un error al procesar el pago.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="text-7xl mb-6">🛒</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Tu carrito está vacío</h1>
        <p className="text-gray-500 mb-8">Explorá nuestros cursos y agregá los que te interesen.</p>
        <Link href="/cursos">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
            Ver cursos
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Tu carrito</h1>
        <button
          onClick={() => { if (confirm('¿Vaciar todo el carrito?')) clearCart(); }}
          className="text-sm text-red-400 hover:text-red-600 font-medium transition"
        >
          Vaciar carrito
        </button>
      </div>

      <div className="space-y-4 mb-8">
        {items.map(item => (
          <div key={item.id} className="bg-white border rounded-xl p-5 flex items-center justify-between shadow-sm gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 text-blue-700 w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                🎓
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-green-600 font-bold">${item.price.toLocaleString('es-AR')} ARS</p>
              </div>
            </div>
            <button
              onClick={() => removeItem(item.id)}
              className="text-red-400 hover:text-red-600 transition text-sm font-medium"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      {/* Resumen */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Subtotal ({items.length} {items.length === 1 ? 'curso' : 'cursos'})</span>
          <span className="font-bold text-lg">${total.toLocaleString('es-AR')} ARS</span>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Procesando pago...' : 'Pagar ahora'}
        </button>
      </div>
    </div>
  );
}
