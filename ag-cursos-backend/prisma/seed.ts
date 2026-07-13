import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function upsertUser(data: {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  isAlumno: boolean;
  isProfesor: boolean;
  isAdmin?: boolean;
}) {
  const hash = await bcrypt.hash(data.password, 10);
  return prisma.user.upsert({
    where: { email: data.email },
    update: {},
    create: {
      email: data.email,
      password: hash,
      nombre: data.nombre,
      apellido: data.apellido,
      isAlumno: data.isAlumno,
      isProfesor: data.isProfesor,
      isAdmin: data.isAdmin ?? false,
    },
  });
}

async function ensureCourse(data: {
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  profesorId: string;
}) {
  const existing = await prisma.course.findFirst({ where: { title: data.title } });
  if (existing) return existing;
  return prisma.course.create({ data });
}

async function ensureModule(data: {
  courseId: string;
  title: string;
  description?: string;
  videoUrl?: string;
  documentUrls?: string[];
}) {
  const existing = await prisma.module.findFirst({ where: { courseId: data.courseId, title: data.title } });
  if (existing) return existing;
  return prisma.module.create({ data: { ...data, documentUrls: data.documentUrls ?? [] } });
}

type QuestionSeed = {
  text: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
  options: { text: string; isCorrect: boolean }[];
};

async function ensureQuiz(moduleId: string, passingScore: number, maxAttempts: number, questions: QuestionSeed[]) {
  const existing = await prisma.quiz.findUnique({ where: { moduleId } });
  if (existing) return existing;

  return prisma.quiz.create({
    data: {
      moduleId,
      passingScore,
      maxAttempts,
      questions: {
        create: questions.map((q, i) => ({
          text: q.text,
          type: q.type,
          order: i + 1,
          options: { create: q.options },
        })),
      },
    },
  });
}

async function ensurePurchase(userId: string, courseId: string) {
  const existing = await prisma.purchase.findFirst({ where: { userId, courseId } });
  if (existing) return existing;
  return prisma.purchase.create({ data: { userId, courseId, status: 'PAID' } });
}

async function main() {
  // --- Usuarios ---
  const profesorLaura = await upsertUser({
    email: 'profesor.laura@agcursos.test',
    password: 'Profesor123!',
    nombre: 'Laura',
    apellido: 'Gómez',
    isAlumno: false,
    isProfesor: true,
  });

  const profesorMartin = await upsertUser({
    email: 'profesor.martin@agcursos.test',
    password: 'Profesor123!',
    nombre: 'Martín',
    apellido: 'Ruiz',
    isAlumno: false,
    isProfesor: true,
  });

  await upsertUser({
    email: 'admin.test@agcursos.test',
    password: 'Admin123!',
    nombre: 'Admin',
    apellido: 'Sistema',
    isAlumno: false,
    isProfesor: false,
    isAdmin: true,
  });

  const alumnoJuan = await upsertUser({
    email: 'alumno.juan@agcursos.test',
    password: 'Alumno123!',
    nombre: 'Juan',
    apellido: 'Pérez',
    isAlumno: true,
    isProfesor: false,
  });

  const alumnoSofia = await upsertUser({
    email: 'alumno.sofia@agcursos.test',
    password: 'Alumno123!',
    nombre: 'Sofía',
    apellido: 'Fernández',
    isAlumno: true,
    isProfesor: false,
  });

  const alumnoDiego = await upsertUser({
    email: 'alumno.diego@agcursos.test',
    password: 'Alumno123!',
    nombre: 'Diego',
    apellido: 'Torres',
    isAlumno: true,
    isProfesor: false,
  });

  const alumnoValentina = await upsertUser({
    email: 'alumno.valentina@agcursos.test',
    password: 'Alumno123!',
    nombre: 'Valentina',
    apellido: 'López',
    isAlumno: true,
    isProfesor: false,
  });

  // --- Curso 1: Cardiología (Laura) ---
  const cardiologia = await ensureCourse({
    title: 'Cardiología Clínica Avanzada',
    description: 'Actualización en diagnóstico y manejo de patologías cardiovasculares frecuentes.',
    price: 38000,
    imageUrl: '/cursos/cardio.jpg',
    profesorId: profesorLaura.id,
  });

  const modAnatomia = await ensureModule({
    courseId: cardiologia.id,
    title: 'Introducción a la anatomía cardíaca',
    description: 'Estructura y función del corazón.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  });

  await ensureQuiz(modAnatomia.id, 70, 3, [
    {
      text: '¿Cuántas cavidades tiene el corazón humano?',
      type: 'MULTIPLE_CHOICE',
      options: [
        { text: '2', isCorrect: false },
        { text: '4', isCorrect: true },
        { text: '6', isCorrect: false },
      ],
    },
    {
      text: 'El ventrículo izquierdo tiene paredes más gruesas que el derecho.',
      type: 'TRUE_FALSE',
      options: [
        { text: 'Verdadero', isCorrect: true },
        { text: 'Falso', isCorrect: false },
      ],
    },
    {
      text: '¿Qué válvula separa la aurícula izquierda del ventrículo izquierdo?',
      type: 'MULTIPLE_CHOICE',
      options: [
        { text: 'Válvula tricúspide', isCorrect: false },
        { text: 'Válvula mitral', isCorrect: true },
        { text: 'Válvula pulmonar', isCorrect: false },
      ],
    },
  ]);

  const modEcg = await ensureModule({
    courseId: cardiologia.id,
    title: 'Electrocardiografía básica',
    description: 'Lectura e interpretación de ECG.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  });

  await ensureQuiz(modEcg.id, 60, 0, [
    {
      text: 'La onda P representa la despolarización auricular.',
      type: 'TRUE_FALSE',
      options: [
        { text: 'Verdadero', isCorrect: true },
        { text: 'Falso', isCorrect: false },
      ],
    },
    {
      text: '¿Qué complejo representa la despolarización ventricular?',
      type: 'MULTIPLE_CHOICE',
      options: [
        { text: 'Complejo QRS', isCorrect: true },
        { text: 'Onda T', isCorrect: false },
        { text: 'Onda P', isCorrect: false },
      ],
    },
  ]);

  await ensureModule({
    courseId: cardiologia.id,
    title: 'Casos clínicos',
    description: 'Análisis de casos reales.',
  });

  // --- Curso 2: Neurología (Martín) ---
  const neurologia = await ensureCourse({
    title: 'Neurología para Generalistas',
    description: 'Semiología e imágenes aplicadas a la práctica clínica diaria.',
    price: 42000,
    imageUrl: '/cursos/neuro.jpg',
    profesorId: profesorMartin.id,
  });

  const modSemiologia = await ensureModule({
    courseId: neurologia.id,
    title: 'Semiología neurológica',
    description: 'Examen físico neurológico completo.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  });

  await ensureQuiz(modSemiologia.id, 70, 0, [
    {
      text: '¿Qué par craneal se evalúa con el reflejo fotomotor?',
      type: 'MULTIPLE_CHOICE',
      options: [
        { text: 'II (óptico) y III (oculomotor)', isCorrect: true },
        { text: 'VII (facial)', isCorrect: false },
        { text: 'X (vago)', isCorrect: false },
      ],
    },
    {
      text: 'El signo de Babinski positivo es normal en adultos.',
      type: 'TRUE_FALSE',
      options: [
        { text: 'Verdadero', isCorrect: false },
        { text: 'Falso', isCorrect: true },
      ],
    },
    {
      text: '¿Cuál escala se usa para evaluar el nivel de consciencia?',
      type: 'MULTIPLE_CHOICE',
      options: [
        { text: 'Escala de Glasgow', isCorrect: true },
        { text: 'Escala de Apgar', isCorrect: false },
        { text: 'Escala de Borg', isCorrect: false },
      ],
    },
  ]);

  await ensureModule({
    courseId: neurologia.id,
    title: 'Imágenes en neurología',
    description: 'TC y RM en patología neurológica.',
  });

  // --- Compras (para poder ver el curso y rendir los cuestionarios) ---
  await ensurePurchase(alumnoJuan.id, cardiologia.id);
  await ensurePurchase(alumnoSofia.id, cardiologia.id);
  await ensurePurchase(alumnoSofia.id, neurologia.id);
  await ensurePurchase(alumnoDiego.id, neurologia.id);
  await ensurePurchase(alumnoValentina.id, neurologia.id);

  console.log('Seed completado.');
  console.log('');
  console.log('Profesores: profesor.laura@agcursos.test / profesor.martin@agcursos.test (pass: Profesor123!)');
  console.log('Alumnos: alumno.juan / alumno.sofia / alumno.diego / alumno.valentina @agcursos.test (pass: Alumno123!)');
  console.log('Admin: admin.test@agcursos.test (pass: Admin123!)');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
