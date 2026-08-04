import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function upsertUser(data: {
  email: string;
  password: string;
  nombre?: string;
  apellido?: string;
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

// Para cuentas reales (no ficticias) no conocemos el password en texto
// plano, solo el hash que ya existe en la BD local. Lo insertamos tal
// cual para que la persona pueda loguearse con la misma contraseña que
// ya usa en local.
async function upsertUserWithHash(data: {
  email: string;
  passwordHash: string;
  nombre?: string;
  apellido?: string;
  isAlumno: boolean;
  isProfesor: boolean;
  isAdmin?: boolean;
}) {
  return prisma.user.upsert({
    where: { email: data.email },
    update: {},
    create: {
      email: data.email,
      password: data.passwordHash,
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
  order: number;
  isFree?: boolean;
}) {
  const existing = await prisma.module.findFirst({ where: { courseId: data.courseId, title: data.title } });
  if (existing) return existing;
  return prisma.module.create({
    data: {
      courseId: data.courseId,
      title: data.title,
      description: data.description,
      videoUrl: data.videoUrl,
      documentUrls: data.documentUrls ?? [],
      order: data.order,
      isFree: data.isFree ?? false,
    },
  });
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

async function ensurePurchase(userId: string, courseId: string, status: string = 'PAID') {
  const existing = await prisma.purchase.findFirst({ where: { userId, courseId } });
  if (existing) return existing;
  return prisma.purchase.create({ data: { userId, courseId, status } });
}

async function ensureCartItem(userId: string, courseId: string) {
  const existing = await prisma.cartItem.findUnique({ where: { userId_courseId: { userId, courseId } } });
  if (existing) return existing;
  return prisma.cartItem.create({ data: { userId, courseId } });
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

  // Cuentas reales (mantienen su password actual via hash)
  const gustavo = await upsertUserWithHash({
    email: 'gustavo.albornoz88@gmail.com',
    passwordHash: '$2b$10$vtmcARcSEegvI2XdcDd1MOAmoiyHP3Dux6qykc/ZjukC1d0EqQAKW',
    isAlumno: true,
    isProfesor: true,
    isAdmin: false,
  });

  const adminGmail = await upsertUserWithHash({
    email: 'admin@gmail.com',
    passwordHash: '$2b$10$EK9HDBb66QQWSU5JQqxzA.KBvlIYriCVVRtyYcKWHmIV2XDXqt4BO',
    isAlumno: true,
    isProfesor: false,
    isAdmin: true,
  });

  const a1991 = await upsertUserWithHash({
    email: 'a1991@gmail.com',
    passwordHash: '$2b$10$xsRQ3dBtx0cExsRwZdR/.upkVFcOKAssT/zV82hu3.hv7ZmpBVpcm',
    isAlumno: true,
    isProfesor: false,
    isAdmin: false,
  });

  const gusiverson9 = await upsertUserWithHash({
    email: 'gusiverson9@gmail.com',
    passwordHash: '$2b$10$LT3eHh3MOyQYjQsd1OIHFeNLbe6JImG5/qLqQMpixHI0zV6d6hhIi',
    isAlumno: true,
    isProfesor: false,
    isAdmin: false,
  });

  // --- Curso: Cardiología (Laura) ---
  const cardiologia = await ensureCourse({
    title: 'Cardiología Clínica Avanzada',
    description: 'Actualización en diagnóstico y manejo de patologías cardiovasculares frecuentes.',
    price: 38000,
    profesorId: profesorLaura.id,
  });

  await ensureModule({ courseId: cardiologia.id, title: 'Introducción', order: 0, isFree: true });

  const modAnatomia = await ensureModule({
    courseId: cardiologia.id,
    title: 'Introducción a la anatomía cardíaca',
    description: 'Estructura y función del corazón.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    order: 1,
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
    order: 2,
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
    order: 3,
  });

  // --- Curso: Neurología (Martín) ---
  const neurologia = await ensureCourse({
    title: 'Neurología para Generalistas',
    description: 'Semiología e imágenes aplicadas a la práctica clínica diaria.',
    price: 42000,
    profesorId: profesorMartin.id,
  });

  await ensureModule({
    courseId: neurologia.id,
    title: 'Introducción',
    description: 'Para entender neurologia siendo generalista',
    videoUrl: 'https://www.youtube.com/embed/wzPvJ1BcmjM?si=QanNbbYotlsdnutt',
    order: 0,
    isFree: true,
  });

  const modSemiologia = await ensureModule({
    courseId: neurologia.id,
    title: 'Semiología neurológica',
    description: 'Examen físico neurológico completo.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    order: 1,
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
    order: 2,
  });

  // --- Curso: Anatomía Humana (gustavo) ---
  const anatomia = await ensureCourse({
    title: 'Anatomía Humana',
    description: 'Aprendé los fundamentos del cuerpo humano: sistemas,\n    órganos y estructuras esenciales para la medicina.',
    price: 12500,
    imageUrl: '/cursos/1780431082484-anatomia.jpg',
    profesorId: gustavo.id,
  });

  await ensureModule({ courseId: anatomia.id, title: 'Introducción', order: 0, isFree: true });

  await ensureModule({
    courseId: anatomia.id,
    title: '1. Introducción a la Anatomía',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    order: 1,
  });

  await ensureModule({
    courseId: anatomia.id,
    title: 'Contenido: Sistemas del Cuerpo',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    documentUrls: [
      '/cursos/1781030992599-Anatomia-Humana-2022-1.pdf',
      '/cursos/1781031004212-instructivo_despliegue_render_vercel.pdf',
    ],
    order: 2,
  });

  // --- Curso: Fisiología Médica (gustavo) ---
  const fisiologia = await ensureCourse({
    title: 'Fisiología Médica',
    description: 'Comprendé cómo funcionan los sistemas del\n  organismo y\n    sus mecanismos de regulación.',
    price: 15000,
    imageUrl: '/cursos/fisiologia.jpg',
    profesorId: gustavo.id,
  });

  await ensureModule({ courseId: fisiologia.id, title: 'Introducción', order: 0, isFree: true });

  await ensureModule({
    courseId: fisiologia.id,
    title: 'Introducción a la Fisiología',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    order: 1,
  });

  await ensureModule({
    courseId: fisiologia.id,
    title: 'Contenido: Regulación del Organismo',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    order: 2,
  });

  // --- Curso: Ecocardiograma (gustavo) ---
  const ecocardiograma = await ensureCourse({
    title: 'Ecocardiograma',
    description: 'hacer eco',
    price: 15000,
    imageUrl: '/cursos/1780437762914-ecocardiograma-1024x1024.png',
    profesorId: gustavo.id,
  });

  await ensureModule({
    courseId: ecocardiograma.id,
    title: 'Introducción',
    description: 'Comienza con nociones de ecocardiograma',
    videoUrl: 'https://www.youtube.com/embed/FU2HroGGBCs?si=b78NvVr8qMfvONOE',
    order: 0,
    isFree: true,
  });

  // --- Curso: Radiologia 2.0 (gustavo) ---
  const radiologia = await ensureCourse({
    title: 'Radiologia 2.0',
    description: 'Actualizaciones en inteligencia artificial aplicada a la radiología',
    price: 45000,
    imageUrl: '/cursos/Xray.jpg',
    profesorId: gustavo.id,
  });

  await ensureModule({ courseId: radiologia.id, title: 'Introducción', order: 0, isFree: true });

  // --- Compras ---
  await ensurePurchase(alumnoJuan.id, cardiologia.id);
  await ensurePurchase(alumnoSofia.id, cardiologia.id);
  await ensurePurchase(alumnoSofia.id, neurologia.id);
  await ensurePurchase(alumnoDiego.id, neurologia.id);
  await ensurePurchase(alumnoValentina.id, neurologia.id);
  await ensurePurchase(profesorLaura.id, neurologia.id);
  await ensurePurchase(adminGmail.id, cardiologia.id);
  await ensurePurchase(a1991.id, anatomia.id);
  await ensurePurchase(a1991.id, radiologia.id, 'PENDING');
  await ensurePurchase(gusiverson9.id, fisiologia.id);
  await ensurePurchase(gusiverson9.id, radiologia.id);
  await ensurePurchase(gusiverson9.id, anatomia.id);
  await ensurePurchase(gusiverson9.id, neurologia.id);

  // --- Carritos ---
  await ensureCartItem(gusiverson9.id, neurologia.id);
  await ensureCartItem(a1991.id, ecocardiograma.id);
  await ensureCartItem(adminGmail.id, neurologia.id);

  console.log('Seed completado.');
  console.log('');
  console.log('Profesores de prueba: profesor.laura@agcursos.test / profesor.martin@agcursos.test (pass: Profesor123!)');
  console.log('Alumnos de prueba: alumno.juan / alumno.sofia / alumno.diego / alumno.valentina @agcursos.test (pass: Alumno123!)');
  console.log('Admin de prueba: admin.test@agcursos.test (pass: Admin123!)');
  console.log('Cuentas reales (gustavo.albornoz88, admin@gmail.com, a1991@gmail.com, gusiverson9@gmail.com): mismo password que usan en local.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
