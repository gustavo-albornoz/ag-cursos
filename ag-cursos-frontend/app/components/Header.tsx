'use client';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

export default function Header() {
  const { items } = useCart();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tight">
          AG Cursos
        </Link>

        <nav className="flex items-center gap-8">
          <Link href="/cursos" className="text-gray-700 hover:text-blue-600 font-medium transition">
            Cursos
          </Link>
          <Link href="/#acerca" className="text-gray-700 hover:text-blue-600 font-medium transition">
            Acerca de Nosotros
          </Link>
          <Link href="/carrito" className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 hover:text-blue-600 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-9H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {items.length}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
