'use client';
import { useState } from 'react';
import Link from 'next/link';

type Course = {
  id: string;
  title: string;
  description: string;
  price: number;
};

export default function CourseCarousel({ courses }: { courses: Course[] }) {
  const [current, setCurrent] = useState(0);

  if (!courses.length) {
    return (
      <div className="text-center py-16 text-gray-400">
        No hay cursos disponibles aún.
      </div>
    );
  }

  const prev = () => setCurrent(i => (i === 0 ? courses.length - 1 : i - 1));
  const next = () => setCurrent(i => (i === courses.length - 1 ? 0 : i + 1));
  const course = courses[current];

  return (
    <div className="relative max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row">
        <div className="bg-blue-600 md:w-64 h-48 md:h-auto flex items-center justify-center flex-shrink-0">
          <span className="text-8xl">🎓</span>
        </div>
        <div className="p-8 flex flex-col justify-center flex-1">
          <span className="text-blue-600 text-sm font-semibold uppercase tracking-wide mb-2">Curso destacado</span>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">{course.title}</h3>
          <p className="text-gray-500 mb-6 line-clamp-3">{course.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-green-600 font-bold text-xl">${course.price.toLocaleString('es-AR')} ARS</span>
            <Link href={`/course/${course.id}`}>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
                Ver curso
              </button>
            </Link>
          </div>
        </div>
      </div>

      {courses.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition"
          >
            ›
          </button>

          <div className="flex justify-center gap-2 mt-5">
            {courses.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2.5 h-2.5 rounded-full transition ${i === current ? 'bg-blue-600' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
