'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Course = { id: string; title: string; description: string; price: number; imageUrl?: string };
type CourseForm = { title: string; description: string; price: string; imageUrl: string };

const emptyForm: CourseForm = { title: '', description: '', price: '', imageUrl: '' };

export default function ProfesorPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState<CourseForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CourseForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || (!user.isProfesor && !user.isAdmin)) router.push('/');
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

  const startEdit = (course: Course) => {
    setEditingId(course.id);
    setEditForm({
      title: course.title,
      description: course.description,
      price: course.price.toString(),
      imageUrl: course.imageUrl || '',
    });
  };

  const handleEdit = async (id: string) => {
    const res = await fetch(`http://localhost:3000/courses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: editForm.title,
        description: editForm.description,
        price: parseFloat(editForm.price),
        imageUrl: editForm.imageUrl || undefined,
      }),
    });
    const updated = await res.json();
    setCourses(prev => prev.map(c => c.id === id ? updated : c));
    setEditingId(null);
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number" placeholder="Precio (ARS)" required value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text" placeholder="Ruta de imagen (ej: /cursos/mi-curso.jpg)" value={form.imageUrl}
              onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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
      <h2 className="text-xl font-bold text-gray-900 mb-5">
        Cursos existentes ({courses.length})
      </h2>

      {courses.length === 0 ? (
        <div className="text-center py-16 text-gray-400 border rounded-xl bg-white">
          <div className="text-5xl mb-3">📚</div>
          <p>Todavía no hay cursos. ¡Creá el primero!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map(course => (
            <div key={course.id} className="bg-white border rounded-xl shadow-sm overflow-hidden">
              {editingId === course.id ? (
                /* Modo edición */
                <div className="p-5 space-y-3">
                  <input
                    value={editForm.title}
                    onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    value={editForm.description}
                    onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number" value={editForm.price}
                      onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                      className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      value={editForm.imageUrl}
                      onChange={e => setEditForm(f => ({ ...f, imageUrl: e.target.value }))}
                      placeholder="/cursos/imagen.jpg"
                      className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(course.id)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                      Guardar
                    </button>
                    <button onClick={() => setEditingId(null)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                /* Modo visualización */
                <div className="p-5 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">${course.price.toLocaleString('es-AR')} ARS</p>
                    {course.imageUrl && <p className="text-xs text-gray-400 mt-0.5">{course.imageUrl}</p>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link href={`/profesor/curso/${course.id}`}>
                      <button className="bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-200 transition">
                        Módulos
                      </button>
                    </Link>
                    <button onClick={() => startEdit(course)} className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(course.id)} className="bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition">
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
