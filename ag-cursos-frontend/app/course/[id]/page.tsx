import Image from 'next/image';
import AddToCartButton from '../../components/AddToCartButton';
import { API_URL } from '../../lib/api';

async function getCourse(id: string) {
  const res = await fetch(`${API_URL}/courses/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Curso no encontrado');
  return res.json();
}

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await getCourse(id);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Cabecera con imagen */}
      <div className="bg-blue-700 text-white rounded-2xl overflow-hidden mb-8">
        {course.imageUrl && (
          <div className="relative h-56 w-full">
            <Image src={course.imageUrl} alt={course.title} fill className="object-cover opacity-30" />
          </div>
        )}
        <div className={`p-8 ${course.imageUrl ? '-mt-20 relative' : ''}`}>
          <h1 className="text-4xl font-bold mb-3">{course.title}</h1>
          <p className="text-blue-100 text-lg mb-6">{course.description}</p>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <span className="text-3xl font-bold">${course.price.toLocaleString('es-AR')} ARS</span>
            <AddToCartButton id={course.id} title={course.title} price={course.price} />
          </div>
        </div>
      </div>

      {/* Módulos */}
      <h2 className="text-2xl font-bold text-gray-900 mb-5">Contenido del curso</h2>
      {!course.modules?.length ? (
        <div className="text-center py-12 text-gray-400 border rounded-xl">
          <div className="text-4xl mb-2">🎬</div>
          <p>Este curso aún no tiene módulos cargados.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {course.modules.map((mod: any, index: number) => (
            <div key={mod.id} className="bg-white border rounded-xl p-5 flex items-center gap-4 shadow-sm">
              <div className="bg-blue-100 text-blue-700 font-bold w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{mod.title}</h3>
                {mod.videoUrl && <p className="text-sm text-gray-400 mt-0.5">📹 Video disponible</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
