import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AG Cursos - Plataforma de Cursos',
  description: 'Plataforma de cursos online',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
