'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import FileUploadInput from '../../components/FileUploadInput';
import { API_URL } from '../../lib/api';

type Course = { id: string; title: string; description: string; price: number; imageUrl?: string };
type CourseForm = { title: string; description: string; price: string; imageUrl: string };

export default function ProfesorMisCursosPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CourseForm>({ title: '', description: '', price: '', imageUrl: '' });

  useEffect(() => {
    if (!user || (!user.isProfesor && !user.isAdmin)) { router.push('/'); return; }
    fetch(`${API_URL}/courses/mine`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => { setCourses(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  const startEdit = (course: Course) => {
    setEditingId(course.id);
    setEditForm({ title: course.title, description: course.description, price: course.price.toString(), imageUrl: course.imageUrl || '' });
  };

  const handleEdit = async (id: string) => {
    const res = await fetch(`${API_URL}/courses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: editForm.title, description: editForm.description, price: parseFloat(editForm.price), imageUrl: editForm.imageUrl || undefined }),
    });
    const updated = await res.json();
    setCourses(prev => prev.map(c => c.id === id ? updated : c));
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que querés eliminar este curso?')) return;
    await fetch(`${API_URL}/courses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  if (loading) return <div className="text-center py-24 text-gray-400">Cargando cursos...</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-4xl font-bold text-gray-900">Mis Cursos</h1>
        <Link href="/profesor">
          <button className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition text-sm">
            + Nuevo curso
          </button>
        </Link>
      </div>
      <p className="text-gray-500 mb-10">Los cursos que administrás</p>

      {courses.length === 0 ? (
        <div className="text-center py-24 border rounded-2xl bg-white">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-xl text-gray-500 mb-6">Todavía no creaste ningún curso.</p>
          <Link href="/profesor">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
              Crear primer curso
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map(course => (
            <div key={course.id} className="bg-white border rounded-xl shadow-sm overflow-hidden">
              {editingId === course.id ? (
                <div className="p-5 space-y-3">
                  <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <div>
                    <textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                      maxLength={500}
                      className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none" />
                    <p className="text-xs text-gray-400 text-right mt-1">{editForm.description.length}/500</p>
                  </div>
                  <input type="number" value={editForm.price} onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="Precio (ARS)"
                    className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <FileUploadInput
                    value={editForm.imageUrl}
                    onChange={url => setEditForm(f => ({ ...f, imageUrl: url }))}
                    placeholder="/cursos/imagen.jpg"
                    accept="image/*"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(course.id)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">Guardar</button>
                    <button onClick={() => setEditingId(null)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition">Cancelar</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-5">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-blue-100">
                    {course.imageUrl ? (
                      <Image src={course.imageUrl} alt={course.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-blue-600 flex items-center justify-center text-2xl">🎓</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-500 truncate">{course.description}</p>
                    <p className="text-sm font-medium text-green-600 mt-0.5">${course.price.toLocaleString('es-AR')} ARS</p>
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
