'use client';
import { use, useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Module = { id: string; title: string; videoUrl: string };

export default function GestionModulosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, token } = useAuth();
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>([]);
  const [courseTitle, setCourseTitle] = useState('');
  const [form, setForm] = useState({ title: '', videoUrl: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || (!user.isProfesor && !user.isAdmin)) router.push('/');
  }, [user]);

  useEffect(() => {
    fetch(`http://localhost:3000/courses/${id}`)
      .then(res => res.json())
      .then(data => {
        setCourseTitle(data.title);
        setModules(data.modules || []);
      });
  }, [id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`http://localhost:3000/courses/${id}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    const newModule = await res.json();
    setModules(prev => [...prev, newModule]);
    setForm({ title: '', videoUrl: '' });
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminár este módulo?')) return;
    await fetch(`http://localhost:3000/modules/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setModules(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/profesor" className="text-blue-600 hover:underline text-sm mb-6 block">
        ← Volver al panel
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Módulos</h1>
      <p className="text-gray-500 mb-10">{courseTitle}</p>

      {/* Formulario nuevo módulo */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Agregar módulo</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <input
            type="text" placeholder="Título del módulo" required value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="url" placeholder="URL del video (YouTube embed)" required value={form.videoUrl}
            onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))}
            className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit" disabled={loading}
            className="bg-purple-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-60"
          >
            {loading ? 'Agregando...' : 'Agregar módulo'}
          </button>
        </form>
      </div>

      {/* Lista de módulos */}
      <div className="space-y-3">
        {modules.map((mod, i) => (
          <div key={mod.id} className="bg-white border rounded-xl p-4 flex items-center gap-4 shadow-sm">
            <div className="bg-purple-100 text-purple-700 font-bold w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0">
              {i + 1}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{mod.title}</p>
              <p className="text-xs text-gray-400 truncate">{mod.videoUrl}</p>
            </div>
            <button
              onClick={() => handleDelete(mod.id)}
              className="text-red-400 hover:text-red-600 text-sm font-medium transition"
            >
              Eliminar
            </button>
          </div>
        ))}
        {modules.length === 0 && (
          <p className="text-center text-gray-400 py-8">Este curso no tiene módulos aún.</p>
        )}
      </div>
    </div>
  );
}
