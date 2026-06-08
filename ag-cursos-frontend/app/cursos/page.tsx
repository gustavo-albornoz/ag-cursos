import CourseCard from '../components/CourseCard';
import { API_URL } from '../lib/api';

async function getCourses() {
  try {
    const res = await fetch(`${API_URL}/courses`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function CursosPage() {
  const courses = await getCourses();

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Todos los cursos</h1>
      <p className="text-gray-500 mb-10">Encontrá el curso que se adapta a tus objetivos</p>

      {courses.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-xl">No hay cursos disponibles aún.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
