import Link from 'next/link';

async function getCourse(id: string) {
  const res = await fetch(`http://localhost:3000/courses/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Curso no encontrado');
  return res.json();
}

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await getCourse(id);

  return (
    <main className="p-10 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="text-blue-600 hover:underline">
          ← Volver al catálogo
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-6">{course.title}</h1>
      <div className="space-y-6">
        {course.modules?.map((mod: any) => (
          <div key={mod.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
            <h2 className="text-xl font-semibold p-4 bg-gray-50 border-b">{mod.title}</h2>
            {mod.videoUrl && (
              <div className="aspect-video">
                <iframe
                  src={mod.videoUrl}
                  className="w-full h-full"
                  allowFullScreen
                  title={mod.title}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
