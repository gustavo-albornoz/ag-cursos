import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-3">AG Cursos</h3>
          <p className="text-sm leading-relaxed">
            Plataforma de cursos online para que aprendas a tu ritmo, cuando y donde quieras.
          </p>
        </div>
        <div>
          <h3 className="text-white font-bold text-lg mb-3">Navegación</h3>
          <ul className="text-sm space-y-2">
            <li><Link href="/cursos" className="hover:text-white transition">Cursos</Link></li>
            <li><Link href="/#acerca" className="hover:text-white transition">Acerca de Nosotros</Link></li>
            <li><Link href="/carrito" className="hover:text-white transition">Carrito</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-bold text-lg mb-3">Contacto</h3>
          <p className="text-sm">info@agcursos.com</p>
          <p className="text-sm mt-1">Buenos Aires, Argentina</p>
        </div>
      </div>
      <div className="border-t border-gray-800 text-center py-4 text-xs">
        © 2026 AG Cursos. Todos los derechos reservados.
      </div>
    </footer>
  );
}
