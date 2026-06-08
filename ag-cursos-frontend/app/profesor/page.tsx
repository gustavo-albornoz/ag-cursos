'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FileUploadInput from '../components/FileUploadInput';
import { API_URL } from '../lib/api';

type Course = { id: string; title: string; price: number; imageUrl?: string };
type CourseForm = { title: string; description: string; price: string; imageUrl: string };

const emptyForm: CourseForm = { title: '', description: '', price: '', imageUrl: '' };

export default function ProfesorPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState<CourseForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || (!user.isProfesor && !user.isAdmin)) router.push('/');
  }, [user]);

  useEffect(() => {
    if (!token) return;
    fetch('${API_URL}/courses/mine', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setCourses(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('${API_URL}/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          price: parseFloat(form.price),
          imageUrl: form.imageUrl || undefined,
        }),
      });
      if (!res.ok) throw new Error('Error al crear el curso');
      const newCourse = await res.json();
      setCourses(prev => [...prev, newCourse]);
      setForm(emptyForm);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Panel de Profesores</h1>
      <p className="text-gray-500 mb-10">Creá un nuevo curso y gestioná tu contenido</p>

      {/* Formulario nuevo curso */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-5">Nuevo curso</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <input
            type="text" placeholder="Título del curso" required value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div>
            <textarea
              placeholder="Descripción" required value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              maxLength={500}
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{form.description.length}/500</p>
          </div>
          <input
            type="number" placeholder="Precio (ARS)" required value={form.price}
            onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FileUploadInput
            value={form.imageUrl}
            onChange={url => setForm(f => ({ ...f, imageUrl: url }))}
            placeholder="Imagen del curso"
            accept="image/*"
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

      {/* Acceso rápido a mis cursos */}
      {courses.length > 0 && (
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Tus cursos ({courses.length})</h2>
            <Link href="/profesor/mis-cursos" className="text-blue-600 hover:underline text-sm font-medium">
              Ver todos →
            </Link>
          </div>
          <div className="space-y-2">
            {courses.slice(0, 5).map(course => (
              <div key={course.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm text-gray-700">{course.title}</span>
                <Link href={`/profesor/curso/${course.id}`}>
                  <button className="text-xs text-purple-600 hover:text-purple-800 font-medium transition">
                    Módulos →
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
