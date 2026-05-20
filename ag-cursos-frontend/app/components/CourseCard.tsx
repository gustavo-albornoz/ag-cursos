import Link from 'next/link';

type Course = {
  id: string;
  title: string;
  description: string;
  price: number;
};

export default function CourseCard({ course }: { course: Course }) {
  return (
    <div className="bg-white border rounded-xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
      <div className="bg-blue-600 h-32 flex items-center justify-center">
        <span className="text-5xl">🎓</span>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h2 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{course.title}</h2>
        <p className="text-gray-500 text-sm mb-4 flex-1 line-clamp-3">{course.description}</p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-green-600 font-bold text-lg">${course.price.toLocaleString('es-AR')} ARS</span>
          <Link href={`/course/${course.id}`}>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              Ver curso
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
