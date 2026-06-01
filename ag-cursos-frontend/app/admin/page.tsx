'use client';
import { useEffect, useState } from 'react';
import { useAuth, User } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!user || !user.isAdmin) router.push('/');
  }, [user]);

  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:3000/users', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setUsers)
      .catch(() => {});
  }, [token]);

  const togglePermission = async (id: string, field: 'isProfesor' | 'isAdmin', current: boolean) => {
    const res = await fetch(`http://localhost:3000/users/${id}/permissions`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ [field]: !current }),
    });
    const updated = await res.json();
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updated } : u));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    await fetch(`http://localhost:3000/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
      <p className="text-gray-500 mb-10">Gestión de usuarios y permisos</p>

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

                {/* isAlumno — siempre activo, no se puede quitar */}
                <td className="px-6 py-4 text-center">
                  <span className="inline-block w-5 h-5 rounded-full bg-blue-500" title="Siempre activo" />
                </td>

                {/* isProfesor — toggle */}
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => togglePermission(u.id, 'isProfesor', u.isProfesor)}
                    disabled={u.id === user?.id}
                    className={`w-12 h-6 rounded-full transition-colors relative ${u.isProfesor ? 'bg-purple-500' : 'bg-gray-300'} disabled:opacity-40`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${u.isProfesor ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </td>

                {/* isAdmin — toggle */}
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
                      onClick={() => handleDelete(u.id)}
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

      <p className="text-xs text-gray-400 mt-4">
        * El permiso de Alumno es permanente. No podés modificar tus propios permisos.
      </p>
    </div>
  );
}
