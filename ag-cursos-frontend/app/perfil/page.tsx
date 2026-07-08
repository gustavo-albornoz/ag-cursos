'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../lib/api';

type ProfileData = {
  email: string;
  nombre: string | null;
  apellido: string | null;
  telefono: string | null;
  fotoPerfil: string | null;
  isAlumno: boolean;
  isProfesor: boolean;
  isAdmin: boolean;
};

function Avatar({ src, nombre, apellido, size = 96 }: { src: string | null; nombre: string | null; apellido: string | null; size?: number }) {
  const initials = [nombre?.[0], apellido?.[0]].filter(Boolean).join('').toUpperCase() || '?';
  if (src) {
    return (
      <Image
        src={src}
        alt="Foto de perfil"
        width={size}
        height={size}
        className="rounded-full object-cover border-4 border-white shadow-md"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center border-4 border-white shadow-md select-none"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}

export default function PerfilPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ nombre: '', apellido: '', telefono: '' });
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editingEmail, setEditingEmail] = useState(false);
  const [emailForm, setEmailForm] = useState({ newEmail: '', currentPassword: '' });
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    fetch(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setProfile(data);
        setForm({ nombre: data.nombre ?? '', apellido: data.apellido ?? '', telefono: data.telefono ?? '' });
      });
  }, [user, token, router]);

  const patchMe = async (data: Partial<ProfileData>) => {
    const res = await fetch(`${API_URL}/users/me`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al guardar los cambios');
    return res.json() as Promise<ProfileData>;
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await patchMe(form);
      setProfile(updated);
      setEditing(false);
      setSuccess('Perfil actualizado correctamente.');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/upload?folder=avatars', { method: 'POST', body: formData });
      const { url, error: uploadError } = await uploadRes.json();
      if (uploadError) throw new Error(uploadError);
      const updated = await patchMe({ fotoPerfil: url });
      setProfile(updated);
    } catch (e: any) {
      setError(e.message || 'Error al subir la foto');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  if (!profile) {
    return <div className="max-w-2xl mx-auto px-6 py-24 text-center text-gray-400">Cargando perfil...</div>;
  }

  const misCursosHref = profile.isProfesor ? '/profesor/mis-cursos' : '/mis-cursos';

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Perfil</h1>

      <div className="bg-white border rounded-xl shadow-sm p-8 space-y-6">

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar src={profile.fotoPerfil} nombre={profile.nombre} apellido={profile.apellido} size={96} />
            {uploadingPhoto && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                <span className="text-white text-xs font-medium">Subiendo...</span>
              </div>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition disabled:opacity-50"
          >
            {uploadingPhoto ? 'Subiendo foto...' : 'Cambiar foto'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>

        <hr className="border-gray-100" />

        {/* Email */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Email</p>
              <p className="text-gray-800 font-medium">{profile.email}</p>
            </div>
            {!editingEmail && (
              <button
                onClick={() => { setEditingEmail(true); setEmailError(''); setEmailSuccess(''); }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition"
              >
                Cambiar
              </button>
            )}
          </div>

          {editingEmail && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3 border">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Nuevo email</label>
                <input
                  type="email"
                  value={emailForm.newEmail}
                  onChange={e => setEmailForm(f => ({ ...f, newEmail: e.target.value }))}
                  className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="nuevo@email.com"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Contraseña actual</label>
                <input
                  type="password"
                  value={emailForm.currentPassword}
                  onChange={e => setEmailForm(f => ({ ...f, currentPassword: e.target.value }))}
                  className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="••••••••"
                />
              </div>
              {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
              {emailSuccess && <p className="text-green-600 text-sm">{emailSuccess}</p>}
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    setSavingEmail(true);
                    setEmailError('');
                    setEmailSuccess('');
                    try {
                      const res = await fetch(`${API_URL}/users/me/email`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify(emailForm),
                      });
                      if (!res.ok) {
                        const body = await res.json();
                        throw new Error(body.message ?? 'Error al cambiar el email');
                      }
                      const updated = await res.json();
                      setProfile(updated);
                      setEditingEmail(false);
                      setEmailForm({ newEmail: '', currentPassword: '' });
                      setEmailSuccess('Email actualizado correctamente.');
                    } catch (e: any) {
                      setEmailError(e.message);
                    } finally {
                      setSavingEmail(false);
                    }
                  }}
                  disabled={savingEmail || !emailForm.newEmail || !emailForm.currentPassword}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                >
                  {savingEmail ? 'Guardando...' : 'Confirmar cambio'}
                </button>
                <button
                  onClick={() => { setEditingEmail(false); setEmailError(''); setEmailForm({ newEmail: '', currentPassword: '' }); }}
                  className="px-4 py-2 rounded-lg text-sm font-semibold border hover:bg-gray-100 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
          {emailSuccess && !editingEmail && <p className="text-green-600 text-sm">{emailSuccess}</p>}
        </div>

        {editing ? (
          <>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Nombre</label>
              <input
                value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Apellido</label>
              <input
                value={form.apellido}
                onChange={e => setForm(f => ({ ...f, apellido: e.target.value }))}
                className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tu apellido"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Teléfono</label>
              <input
                value={form.telefono}
                onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: +54 11 1234-5678"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60"
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <button
                onClick={() => { setEditing(false); setError(''); }}
                className="px-5 py-2 rounded-lg text-sm font-semibold border hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Nombre</p>
              <p className="text-gray-800 font-medium">{profile.nombre || <span className="text-gray-400 italic">Sin completar</span>}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Apellido</p>
              <p className="text-gray-800 font-medium">{profile.apellido || <span className="text-gray-400 italic">Sin completar</span>}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Teléfono</p>
              <p className="text-gray-800 font-medium">{profile.telefono || <span className="text-gray-400 italic">Sin completar</span>}</p>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}

            <button
              onClick={() => { setEditing(true); setSuccess(''); }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition"
            >
              Editar datos
            </button>
          </>
        )}
      </div>

      <div className="mt-8 text-center">
        <Link
          href={misCursosHref}
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          Ver Mis Cursos →
        </Link>
      </div>
    </div>
  );
}
