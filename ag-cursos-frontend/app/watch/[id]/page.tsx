import Link from 'next/link';
import { API_URL } from '../../lib/api';
import WatchModules from './WatchModules';

async function getCourse(id: string) {
  const res = await fetch(`${API_URL}/courses/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Curso no encontrado');
  return res.json();
}

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await getCourse(id);

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <Link href="/mis-cursos" className="text-blue-600 hover:underline text-sm mb-6 block">
        ← Volver a mis cursos
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
      {course.description && (
        <p className="text-gray-500 mb-10">{course.description}</p>
      )}
      <WatchModules modules={course.modules ?? []} />
    </main>
  );
}
