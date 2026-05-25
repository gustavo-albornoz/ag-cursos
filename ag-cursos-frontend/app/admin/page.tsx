'use client';
import { useEffect, useState } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

type User = { id: string; email: string; role: UserRole };

export default function AdminPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') router.push('/');
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

  const handleRoleChange = async (id: string, role: UserRole) => {
    const res = await fetch(`http://localhost:3000/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role }),
    });
    const updated = await res.json();
    setUsers(prev => prev.map(u => u.id === id ? updated : u));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    await fetch(`http://localhost:3000/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const roleColors: Record<UserRole, string> = {
    ALUMNO: 'bg-blue-100 text-blue-700',
    PROFESOR: 'bg-purple-100 text-purple-700',
    ADMIN: 'bg-red-100 text-red-700',
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
      <p className="text-gray-500 mb-10">Gestión de usuarios</p>

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Email</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Rol</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Cambiar rol</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm text-gray-900">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleColors[u.role]}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={u.role}
                    onChange={e => handleRoleChange(u.id, e.target.value as UserRole)}
                    className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALUMNO">ALUMNO</option>
                    <option value="PROFESOR">PROFESOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
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
    </div>
  );
}
