import Link from 'next/link';
import CourseCarousel from './components/CourseCarousel';

async function getCourses() {
  try {
    const res = await fetch('http://localhost:3000/courses', { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

const importantSections = [
  { icon: '💻', title: 'Programación Web', description: 'HTML, CSS, JavaScript, React y más para construir sitios modernos.' },
  { icon: '🗄️', title: 'Bases de Datos', description: 'SQL, PostgreSQL, MongoDB. Diseñá y administrá bases de datos eficientemente.' },
  { icon: '🤖', title: 'Inteligencia Artificial', description: 'Machine Learning, redes neuronales y herramientas de IA aplicadas.' },
  { icon: '📱', title: 'Desarrollo Mobile', description: 'Creá aplicaciones para iOS y Android con React Native y Flutter.' },
];

export default async function Home() {
  const courses = await getCourses();

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-500 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4 leading-tight">
            Aprendé sin límites
          </h1>
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

      {/* Sección 2: Secciones Más Importantes */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Secciones Más Importantes</h2>
          <p className="text-gray-500 text-center mb-10">Las áreas de conocimiento más demandadas del mercado</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {importantSections.map((section) => (
              <div key={section.title} className="bg-gray-50 border rounded-xl p-6 text-center hover:shadow-md transition">
                <div className="text-5xl mb-4">{section.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{section.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{section.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección 3: Acerca de Nosotros */}
      <section id="acerca" className="py-16 px-6 bg-blue-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Acerca de Nosotros</h2>
          <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            AG Cursos nació con la misión de democratizar el acceso al conocimiento técnico en Argentina y Latinoamérica.
            Creamos contenido de calidad, pensado para quienes quieren crecer profesionalmente.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-1">100%</div>
              <div className="text-blue-200 text-sm">Contenido en español</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-1">∞</div>
              <div className="text-blue-200 text-sm">Acceso de por vida</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-1">📱</div>
              <div className="text-blue-200 text-sm">Desde cualquier dispositivo</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
