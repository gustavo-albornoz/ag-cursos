'use client';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef, useState } from 'react';

type Course = { id: string; title: string };

export default function Header() {
  const { items } = useCart();
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('http://localhost:3000/courses')
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setCourses(data) : setCourses([]))
      .catch(err => console.error('[Header] Error cargando cursos:', err));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tight">
          AG Cursos
        </Link>

        <nav className="flex items-center gap-8">
          {/* Dropdown Cursos */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(o => !o)}
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

          {/* Sección Profesor */}
          {(user?.isProfesor || user?.isAdmin) && (
            <Link href="/profesor" className="text-purple-600 hover:text-purple-700 font-medium transition">
              Profesores
            </Link>
          )}

          {/* Sección Admin */}
          {user?.isAdmin && (
            <Link href="/admin" className="text-red-600 hover:text-red-700 font-medium transition">
              Admin
            </Link>
          )}

          {/* Carrito */}
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

          {/* Sesión */}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{user.email}</span>
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
      </div>
    </header>
  );
}
