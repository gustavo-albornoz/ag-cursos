'use client';
import { useState } from 'react';
import { useAuth, SessionConflictError } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSessionConflict, setShowSessionConflict] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      if (err instanceof SessionConflictError) {
        setShowSessionConflict(true);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForceLogin = async () => {
    setLoading(true);
    try {
      await login(email, password, true);
      setShowSessionConflict(false);
      router.push('/');
    } catch (err: any) {
      setShowSessionConflict(false);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white border rounded-2xl shadow-sm p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Iniciar sesión</h1>
        <p className="text-gray-500 mb-8">Ingresá con tu cuenta de AG Cursos</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿No tenés cuenta?{' '}
          <Link href="/register" className="text-blue-600 hover:underline font-medium">
            Registrate
          </Link>
        </p>
      </div>

      {showSessionConflict && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">No podés iniciar sesión acá</h2>
            <p className="text-gray-500 mb-6">
              Tu cuenta ya tiene una sesión activa en otro dispositivo. Solo se permite un inicio de sesión a la vez por usuario.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleForceLogin}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-60"
              >
                {loading ? 'Cerrando la otra sesión...' : 'Cerrar esa sesión e iniciar acá'}
              </button>
              <button
                onClick={() => setShowSessionConflict(false)}
                className="w-full border py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
