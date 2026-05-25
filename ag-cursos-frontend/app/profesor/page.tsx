'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Course = { id: string; title: string; description: string; price: number };

export default function ProfesorPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState({ title: '', description: '', price: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || (user.role !== 'PROFESOR' && user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user]);

  useEffect(() => {
    fetch('http://localhost:3000/courses')
      .then(res => res.json())
      .then(setCourses)
      .catch(() => {});
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
      });
      if (!res.ok) throw new Error('Error al crear el curso');
      const newCourse = await res.json();
      setCourses(prev => [...prev, newCourse]);
      setForm({ title: '', description: '', price: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que querés eliminar este curso?')) return;
    await fetch(`http://localhost:3000/courses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Panel de Profesores</h1>
      <p className="text-gray-500 mb-10">Gestioná los cursos y su contenido</p>

      {/* Formulario nuevo curso */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-5">Nuevo curso</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <input
            type="text" placeholder="Título del curso" required value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Descripción" required value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
          />
          <input
            type="number" placeholder="Precio (ARS)" required value={form.price}
            onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? 'Creando...' : 'Crear curso'}
          </button>
        </form>
      </div>

      {/* Lista de cursos */}
      <h2 className="text-xl font-bold text-gray-900 mb-5">Cursos existentes</h2>
      <div className="space-y-4">
        {courses.map(course => (
          <div key={course.id} className="bg-white border rounded-xl p-5 flex items-center justify-between gap-4 shadow-sm">
            <div>
              <h3 className="font-semibold text-gray-900">{course.title}</h3>
              <p className="text-sm text-gray-500">${course.price.toLocaleString('es-AR')} ARS</p>
            </div>
            <div className="flex gap-3">
              <Link href={`/profesor/curso/${course.id}`}>
                <button className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-200 transition">
                  Gestionar módulos
                </button>
              </Link>
              <button
                onClick={() => handleDelete(course.id)}
                className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
