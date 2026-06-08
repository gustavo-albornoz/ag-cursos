'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import AddToCartButton from '../components/AddToCartButton';
import { API_URL } from '../lib/api';

type Course = { id: string; title: string; description: string; price: number; imageUrl?: string };

function BuscarResultados() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/courses`)
      .then(res => res.json())
      .then(data => {
        setCourses(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const results = courses.filter(c =>
    c.title.toLowerCase().includes(q.toLowerCase()) ||
    c.description.toLowerCase().includes(q.toLowerCase())
  );

  if (loading) return <div className="text-center py-24 text-gray-400">Buscando...</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">
        Resultados para <span className="text-blue-600">"{q}"</span>
      </h1>
      <p className="text-gray-500 mb-10">
        {results.length === 0
          ? 'No se encontraron cursos.'
          : `${results.length} ${results.length === 1 ? 'curso encontrado' : 'cursos encontrados'}`}
      </p>

      {results.length === 0 ? (
        <div className="text-center py-20 border rounded-2xl bg-white">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-xl text-gray-500 mb-6">No encontramos cursos que coincidan con tu búsqueda.</p>
          <Link href="/cursos">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
              Ver todos los cursos
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map(course => (
            <div key={course.id} className="bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="relative h-40 bg-blue-100">
                {course.imageUrl ? (
                  <Image src={course.imageUrl} alt={course.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">🎓</div>
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h2 className="font-bold text-gray-900 text-lg mb-1 line-clamp-2">{course.title}</h2>
                <p className="text-gray-500 text-sm mb-4 line-clamp-3 flex-1">{course.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-green-600 font-bold">${course.price.toLocaleString('es-AR')} ARS</span>
                  <Link href={`/course/${course.id}`} className="text-blue-600 hover:underline text-sm font-medium">
                    Ver curso →
                  </Link>
                </div>
                <div className="mt-3">
                  <AddToCartButton id={course.id} title={course.title} price={course.price} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BuscarPage() {
  return (
    <Suspense fallback={<div className="text-center py-24 text-gray-400">Buscando...</div>}>
      <BuscarResultados />
    </Suspense>
  );
}
