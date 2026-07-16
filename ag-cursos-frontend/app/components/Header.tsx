'use client';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '../lib/api';

type Course = { id: string; title: string };

export default function Header() {
  const { items } = useCart();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchCourses = () => {
    fetch(`${API_URL}/courses`)
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setCourses(data) : setCourses([]))
      .catch(() => {});
  };

  useEffect(() => { fetchCourses(); }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { setMobileMenuOpen(false); }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearchQuery('');
    setMobileMenuOpen(false);
    router.push(`/buscar?q=${encodeURIComponent(q)}`);
  };

  const SearchForm = ({ className = '' }: { className?: string }) => (
    <form onSubmit={handleSearch} className={className}>
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar cursos..."
          className="w-full border rounded-lg pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </button>
      </div>
    </form>
  );

  const CartLink = () => (
    <Link href="/carrito" className="relative flex-shrink-0" onClick={() => setMobileMenuOpen(false)}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 hover:text-blue-600 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-9H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      {items.length > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
          {items.length}
        </span>
      )}
    </Link>
  );

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center gap-4 md:gap-6">
          {/* Logo */}
          <Link href="/" className="text-xl md:text-2xl font-bold text-blue-600 tracking-tight flex-shrink-0">
            AG Cursos
          </Link>

          {/* Buscador — solo desktop en esta fila */}
          <SearchForm className="hidden md:block flex-1 max-w-sm" />

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-6 ml-auto">
            {/* Dropdown Cursos */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => { const next = !dropdownOpen; setDropdownOpen(next); if (next) fetchCourses(); }}
                className="flex items-center gap-1 text-gray-700 hover:text-blue-600 font-medium transition"
              >
                Cursos
                <svg className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border rounded-xl shadow-lg overflow-hidden z-50">
                  <Link href="/cursos" onClick={() => setDropdownOpen(false)} className="block px-4 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 border-b transition">
                    Ver todos los cursos →
                  </Link>
                  {courses.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-gray-400">Sin cursos disponibles</p>
                  ) : (
                    courses.map(course => (
                      <Link key={course.id} href={`/course/${course.id}`} onClick={() => setDropdownOpen(false)} className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition border-b last:border-0">
                        {course.title}
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>

            <Link href="/#acerca" className="text-gray-700 hover:text-blue-600 font-medium transition">
              Acerca de Nosotros
            </Link>

            {/* Mis Cursos — alumno */}
            {user && !user.isProfesor && !user.isAdmin && (
              <Link href="/mis-cursos" className="text-gray-700 hover:text-blue-600 font-medium transition">
                Mis Cursos
              </Link>
            )}

            {/* Mis Cursos — profesor */}
            {user?.isProfesor && !user?.isAdmin && (
              <Link href="/profesor/mis-cursos" className="text-purple-600 hover:text-purple-700 font-medium transition">
                Mis Cursos
              </Link>
            )}

            {/* Admin */}
            {user?.isAdmin && (
              <Link href="/admin" className="text-red-600 hover:text-red-700 font-medium transition">
                Admin
              </Link>
            )}

            <CartLink />

            {/* Sesión */}
            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/perfil" className="text-sm text-gray-500 hover:text-blue-600 transition">
                  {user.email}
                </Link>
                <button onClick={logout} className="text-sm text-red-500 hover:text-red-700 font-medium transition">
                  Salir
                </button>
              </div>
            ) : (
              <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                Iniciar sesión
              </Link>
            )}
          </nav>

          {/* Acciones mobile: carrito + hamburguesa */}
          <div className="flex md:hidden items-center gap-4 ml-auto">
            <CartLink />
            <button
              onClick={() => setMobileMenuOpen(open => !open)}
              aria-label="Abrir menú"
              className="text-gray-700 hover:text-blue-600 transition flex-shrink-0"
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Buscador — fila propia en mobile */}
        <SearchForm className="md:hidden mt-3" />
      </div>

      {/* Menú mobile */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t bg-white px-4 py-4 space-y-1">
          <Link
            href="/cursos"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-2 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition"
          >
            Cursos
          </Link>
          <Link
            href="/#acerca"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-2 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition"
          >
            Acerca de Nosotros
          </Link>

          {user && !user.isProfesor && !user.isAdmin && (
            <Link
              href="/mis-cursos"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-2 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition"
            >
              Mis Cursos
            </Link>
          )}

          {user?.isProfesor && !user?.isAdmin && (
            <Link
              href="/profesor/mis-cursos"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-2 py-2.5 text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition"
            >
              Mis Cursos
            </Link>
          )}

          {user?.isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-2 py-2.5 text-red-600 hover:bg-red-50 rounded-lg font-medium transition"
            >
              Admin
            </Link>
          )}

          <div className="border-t pt-3 mt-3">
            {user ? (
              <div className="flex items-center justify-between px-2">
                <Link
                  href="/perfil"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm text-gray-500 hover:text-blue-600 transition truncate"
                >
                  {user.email}
                </Link>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="text-sm text-red-500 hover:text-red-700 font-medium transition flex-shrink-0 ml-3"
                >
                  Salir
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
