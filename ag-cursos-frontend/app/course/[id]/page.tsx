import CheckoutButton from './CheckoutButton';

async function getCourse(id: string) {
  const res = await fetch(`http://localhost:3000/courses/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Curso no encontrado');
  return res.json();
}

export default async function CoursePage({ params }: { params: { id: string } }) {
  const course = await getCourse(params.id);
  const mockUserId = 'user-demo-123';

  return (
    <main className="p-10 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
      <p className="text-gray-600 mb-4">{course.description}</p>
      <p className="text-2xl font-bold text-green-600 mb-6">${course.price} ARS</p>

      <h2 className="text-xl font-semibold mb-3">Módulos del curso</h2>
      <ul className="mb-6 space-y-2">
        {course.modules?.map((mod: any) => (
          <li key={mod.id} className="border rounded p-3 bg-white">
            {mod.title}
          </li>
        ))}
      </ul>

      <CheckoutButton courseId={course.id} userId={mockUserId} />
    </main>
  );
}
