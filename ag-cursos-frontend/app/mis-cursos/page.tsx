'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

type Course = { id: string; title: string; description: string; price: number; imageUrl?: string };
type Purchase = { id: string; course: Course };

export default function MisCursosPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    fetch('http://localhost:3000/checkout/mis-cursos', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => { setPurchases(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, token]);

  if (loading) return <div className="text-center py-24 text-gray-400">Cargando tus cursos...</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Mis Cursos</h1>
      <p className="text-gray-500 mb-10">Los cursos que adquiriste</p>

      {purchases.length === 0 ? (
        <div className="text-center py-24 border rounded-2xl bg-white">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-xl text-gray-500 mb-6">Todavía no tenés cursos adquiridos.</p>
          <Link href="/cursos">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
              Ver cursos disponibles
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchases.map(({ course }) => (
            <div key={course.id} className="bg-white border rounded-xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
              <div className="relative h-44 bg-blue-100 flex-shrink-0">
                {course.imageUrl ? (
                  <Image src={course.imageUrl} alt={course.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-blue-600 flex items-center justify-center">
                    <span className="text-5xl">🎓</span>
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">{course.title}</h2>
                <p className="text-gray-500 text-sm mb-4 flex-1 line-clamp-2">{course.description}</p>
                <Link href={`/watch/${course.id}`} className="mt-auto">
                  <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">
                    Continuar aprendiendo →
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
