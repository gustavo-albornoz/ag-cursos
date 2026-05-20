import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';

export const metadata: Metadata = {
  title: 'AG Cursos - Plataforma de Cursos Online',
  description: 'Aprendé a tu ritmo con nuestros cursos online',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 flex flex-col">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
