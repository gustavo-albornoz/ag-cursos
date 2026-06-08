import Link from 'next/link';
import Image from 'next/image';
import CourseCarousel from './components/CourseCarousel';
import { API_URL } from './lib/api';

async function getCourses() {
  try {
    const res = await fetch(`${API_URL}/courses`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}


export default async function Home() {
  const courses = await getCourses();

  return (
    <>
      {/* Hero */}
      <section className="relative bg-blue-700 text-white py-28 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/hero.jpg" alt="Hero" fill className="object-cover opacity-20" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4 leading-tight">Aprendé sin límites</h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Cursos online con contenido audiovisual de calidad. Avanzá a tu ritmo, desde cualquier lugar.
          </p>
          <Link href="/cursos">
            <button className="bg-white text-blue-700 px-8 py-3 rounded-xl font-bold text-lg hover:bg-blue-50 transition shadow-lg">
              Ver todos los cursos
            </button>
          </Link>
        </div>
      </section>

      {/* Sección 1: Carrusel de Cursos */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Carrusel de Cursos</h2>
          <p className="text-gray-500 text-center mb-10">Explorá nuestra selección de cursos destacados</p>
          <CourseCarousel courses={courses} />
        </div>
      </section>

      {/* Sección 2: Acerca de Nosotros */}
      <section id="acerca" className="py-16 px-6 bg-gray-900 text-white overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="relative w-full md:w-96 h-64 rounded-2xl overflow-hidden flex-shrink-0">
            <Image src="/about.jpg" alt="Acerca de nosotros" fill className="object-cover" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-4">Acerca de Nosotros</h2>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              AG Cursos nació con la misión de democratizar el acceso al conocimiento técnico en Argentina y Latinoamérica.
              Creamos contenido de calidad, pensado para quienes quieren crecer profesionalmente.
            </p>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold mb-1">100%</div>
                <div className="text-gray-400 text-sm">Contenido en español</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-1">∞</div>
                <div className="text-gray-400 text-sm">Acceso de por vida</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-1">📱</div>
                <div className="text-gray-400 text-sm">Cualquier dispositivo</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
