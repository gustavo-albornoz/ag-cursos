import Link from 'next/link';

async function getCourses() {
  const res = await fetch('http://localhost:3000/courses', { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al cargar cursos');
  return res.json();
}

export default async function Home() {
  const courses = await getCourses();

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6">Catálogo de Cursos</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map((course: any) => (
          <div key={course.id} className="border p-4 rounded-lg shadow-sm bg-white">
            <h2 className="text-xl font-semibold">{course.title}</h2>
            <p className="text-gray-600 my-2">{course.description}</p>
            <p className="font-bold text-green-600">${course.price} ARS</p>
            <Link href={`/course/${course.id}`}>
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                Ver Detalles
              </button>
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
