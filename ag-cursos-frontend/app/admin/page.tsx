'use client';
import { useEffect, useState } from 'react';
import { useAuth, User } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_URL } from '../lib/api';

type AdminCourse = {
  id: string;
  title: string;
  isActive: boolean;
  price: number;
  profesor?: { email: string } | null;
};

export default function AdminPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);

  useEffect(() => {
    if (!user || !user.isAdmin) router.push('/');
  }, [user]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setUsers)
      .catch(() => {});

    fetch(`${API_URL}/courses/admin`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setCourses(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [token]);

  const togglePermission = async (id: string, field: 'isProfesor' | 'isAdmin', current: boolean) => {
    const res = await fetch(`${API_URL}/users/${id}/permissions`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ [field]: !current }),
    });
    const updated = await res.json();
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updated } : u));
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const toggleCourse = async (id: string) => {
    const res = await fetch(`${API_URL}/courses/${id}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    const updated = await res.json();
    setCourses(prev => prev.map(c => c.id === id ? { ...c, isActive: updated.isActive } : c));
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-14">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-1">Panel de Administración</h1>
        <p className="text-gray-500">Gestión de usuarios, permisos y cursos</p>
      </div>

      {/* Usuarios */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-5">Usuarios</h2>
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Email</th>
                <th className="text-center px-6 py-3 text-sm font-semibold text-gray-600">Alumno</th>
                <th className="text-center px-6 py-3 text-sm font-semibold text-gray-600">Profesor</th>
                <th className="text-center px-6 py-3 text-sm font-semibold text-gray-600">Admin</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-900">{u.email}</td>

                  <td className="px-6 py-4 text-center">
                    <span className="inline-block w-5 h-5 rounded-full bg-blue-500" title="Siempre activo" />
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => togglePermission(u.id, 'isProfesor', u.isProfesor)}
                      disabled={u.id === user?.id}
                      className={`w-12 h-6 rounded-full transition-colors relative ${u.isProfesor ? 'bg-purple-500' : 'bg-gray-300'} disabled:opacity-40`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${u.isProfesor ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => togglePermission(u.id, 'isAdmin', u.isAdmin)}
                      disabled={u.id === user?.id}
                      className={`w-12 h-6 rounded-full transition-colors relative ${u.isAdmin ? 'bg-red-500' : 'bg-gray-300'} disabled:opacity-40`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${u.isAdmin ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </td>

                  <td className="px-6 py-4 text-right">
                    {u.id !== user?.id && (
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="text-red-400 hover:text-red-600 text-sm font-medium transition"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          * El permiso de Alumno es permanente. No podés modificar tus propios permisos.
        </p>
      </section>

      {/* Cursos */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-5">Cursos</h2>
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Título</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Profesor</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Precio</th>
                <th className="text-center px-6 py-3 text-sm font-semibold text-gray-600">Activo</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {courses.map(c => (
                <tr key={c.id} className={`hover:bg-gray-50 transition ${!c.isActive ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{c.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.profesor?.email ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">${c.price.toLocaleString('es-AR')} ARS</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleCourse(c.id)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${c.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${c.isActive ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-400 text-sm">No hay cursos cargados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          * Los cursos desactivados no son visibles para los alumnos.
        </p>
      </section>
    </div>
  );
}
