'use client';
import { use, useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FileUploadInput from '../../../components/FileUploadInput';
import { API_URL } from '../../../lib/api';

type Module = { id: string; title: string; description?: string; videoUrl?: string; documentUrls?: string[] };
type ModuleForm = { title: string; description: string; videoUrl: string; documentUrls: string[] };

const emptyForm: ModuleForm = { title: '', description: '', videoUrl: '', documentUrls: [] };

function DocList({
  urls,
  onChange,
}: {
  urls: string[];
  onChange: (urls: string[]) => void;
}) {
  const add = () => onChange([...urls, '']);
  const remove = (i: number) => onChange(urls.filter((_, idx) => idx !== i));
  const update = (i: number, url: string) => {
    const next = [...urls];
    next[i] = url;
    onChange(next);
  };

  return (
    <div>
      <p className="text-xs text-gray-500 mb-2">Documentos (PDF/DOC, opcional)</p>
      {urls.map((url, i) => (
        <div key={i} className="flex items-center gap-2 mb-2">
          <div className="flex-1">
            <FileUploadInput
              value={url}
              onChange={newUrl => update(i, newUrl)}
              placeholder="Documento (PDF/DOC)"
              accept=".pdf,.doc,.docx"
            />
          </div>
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-red-400 hover:text-red-600 text-sm font-medium flex-shrink-0"
          >
            Quitar
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="text-sm text-purple-600 hover:text-purple-800 font-medium"
      >
        + Agregar documento
      </button>
    </div>
  );
}

export default function GestionModulosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, token } = useAuth();
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>([]);
  const [courseTitle, setCourseTitle] = useState('');
  const [form, setForm] = useState<ModuleForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ModuleForm>(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || (!user.isProfesor && !user.isAdmin)) router.push('/');
  }, [user]);

  useEffect(() => {
    fetch(`${API_URL}/courses/${id}`)
      .then(res => res.json())
      .then(data => {
        setCourseTitle(data.title);
        setModules(data.modules || []);
      });
  }, [id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`${API_URL}/courses/${id}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: form.title,
        description: form.description || undefined,
        videoUrl: form.videoUrl || undefined,
        documentUrls: form.documentUrls.filter(u => u.trim()),
      }),
    });
    const newModule = await res.json();
    setModules(prev => [...prev, newModule]);
    setForm(emptyForm);
    setLoading(false);
  };

  const startEdit = (mod: Module) => {
    setEditingId(mod.id);
    setEditForm({
      title: mod.title,
      description: mod.description || '',
      videoUrl: mod.videoUrl || '',
      documentUrls: mod.documentUrls || [],
    });
  };

  const handleEdit = async (modId: string) => {
    const res = await fetch(`${API_URL}/modules/${modId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: editForm.title,
        description: editForm.description || undefined,
        videoUrl: editForm.videoUrl || undefined,
        documentUrls: editForm.documentUrls.filter(u => u.trim()),
      }),
    });
    const updated = await res.json();
    setModules(prev => prev.map(m => m.id === modId ? updated : m));
    setEditingId(null);
  };

  const handleDelete = async (modId: string) => {
    if (!confirm('¿Eliminár este módulo?')) return;
    await fetch(`${API_URL}/modules/${modId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setModules(prev => prev.filter(m => m.id !== modId));
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/profesor/mis-cursos" className="text-blue-600 hover:underline text-sm mb-6 block">
        ← Volver a mis cursos
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
          <div>
            <textarea
              placeholder="Descripción del módulo (opcional)" value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              maxLength={500}
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{form.description.length}/500</p>
          </div>
          <input
            type="url" placeholder="URL del video (YouTube embed, opcional)" value={form.videoUrl}
            onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))}
            className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <DocList
            urls={form.documentUrls}
            onChange={urls => setForm(f => ({ ...f, documentUrls: urls }))}
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
          <div key={mod.id} className="bg-white border rounded-xl shadow-sm overflow-hidden">
            {editingId === mod.id ? (
              <div className="p-5 space-y-3">
                <input
                  value={editForm.title}
                  onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <textarea
                    placeholder="Descripción (opcional)" value={editForm.description}
                    onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                    maxLength={500}
                    className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                  />
                  <p className="text-xs text-gray-400 text-right mt-1">{editForm.description.length}/500</p>
                </div>
                <input
                  type="url" placeholder="URL del video (opcional)" value={editForm.videoUrl}
                  onChange={e => setEditForm(f => ({ ...f, videoUrl: e.target.value }))}
                  className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <DocList
                  urls={editForm.documentUrls}
                  onChange={urls => setEditForm(f => ({ ...f, documentUrls: urls }))}
                />
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(mod.id)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                    Guardar
                  </button>
                  <button onClick={() => setEditingId(null)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4">
                <div className="bg-purple-100 text-purple-700 font-bold w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{mod.title}</p>
                  <div className="flex gap-3 mt-0.5">
                    {mod.videoUrl && <span className="text-xs text-blue-500">🎬 Video</span>}
                    {mod.documentUrls && mod.documentUrls.length > 0 && (
                      <span className="text-xs text-green-600">
                        📄 {mod.documentUrls.length} doc{mod.documentUrls.length > 1 ? 's' : ''}
                      </span>
                    )}
                    {!mod.videoUrl && (!mod.documentUrls || mod.documentUrls.length === 0) && (
                      <span className="text-xs text-gray-400">Sin material</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => startEdit(mod)}
                    className="text-blue-500 hover:text-blue-700 text-sm font-medium transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(mod.id)}
                    className="text-red-400 hover:text-red-600 text-sm font-medium transition"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {modules.length === 0 && (
          <p className="text-center text-gray-400 py-8">Este curso no tiene módulos aún.</p>
        )}
      </div>
    </div>
  );
}
