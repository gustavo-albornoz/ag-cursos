import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type OptionInput = { text: string; isCorrect: boolean };
type QuestionInput = { text: string; type: string; options: OptionInput[] };

@Injectable()
export class CourseModulesService {
  constructor(private prisma: PrismaService) {}

  async create(courseId: string, data: { title: string; description?: string; videoUrl?: string; documentUrls?: string[] }) {
    return this.prisma.module.create({ data: { ...data, courseId } });
  }

  async update(id: string, data: { title?: string; description?: string; videoUrl?: string; documentUrls?: string[] }) {
    return this.prisma.module.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.module.delete({ where: { id } });
  }

  // --- Quiz ---

  private readonly quizInclude = {
    questions: {
      orderBy: { order: 'asc' as const },
      include: { options: true },
    },
  };

  async getQuiz(moduleId: string) {
    return this.prisma.quiz.findUnique({ where: { moduleId }, include: this.quizInclude });
  }

  async upsertQuiz(moduleId: string, data: { passingScore?: number; maxAttempts?: number }) {
    return this.prisma.quiz.upsert({
      where: { moduleId },
      create: { moduleId, ...data },
      update: data,
      include: this.quizInclude,
    });
  }

  async deleteQuiz(moduleId: string) {
    return this.prisma.quiz.delete({ where: { moduleId } });
  }

  async addQuestion(quizId: string, data: QuestionInput) {
    this.validateOptions(data.type, data.options);
    const count = await this.prisma.question.count({ where: { quizId } });
    return this.prisma.question.create({
      data: {
        quizId,
        text: data.text,
        type: data.type,
        order: count + 1,
        options: { create: data.options },
      },
      include: { options: true },
    });
  }

  async updateQuestion(questionId: string, data: { text?: string; type?: string; options?: OptionInput[] }) {
    if (data.options !== undefined) {
      const type = data.type ?? (await this.prisma.question.findUnique({ where: { id: questionId } }))?.type ?? '';
      this.validateOptions(type, data.options);
      await this.prisma.option.deleteMany({ where: { questionId } });
    }
    const { options, ...rest } = data;
    return this.prisma.question.update({
      where: { id: questionId },
      data: {
        ...rest,
        ...(options !== undefined && { options: { create: options } }),
      },
      include: { options: true },
    });
  }

  async removeQuestion(questionId: string) {
    return this.prisma.question.delete({ where: { id: questionId } });
  }

  // --- Endpoints de alumno ---

  async getQuizForStudent(moduleId: string, userId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { moduleId },
      include: { questions: { orderBy: { order: 'asc' }, include: { options: true } } },
    });
    if (!quiz) return null;

    const attemptCount = await this.prisma.quizAttempt.count({ where: { quizId: quiz.id, userId } });
    const canAttempt = quiz.maxAttempts === 0 || attemptCount < quiz.maxAttempts;
    return { ...quiz, attemptCount, canAttempt };
  }

  async submitAttempt(quizId: string, userId: string, answers: { questionId: string; optionId: string }[]) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: { include: { options: true } } },
    });
    if (!quiz) throw new NotFoundException('Cuestionario no encontrado');

    const attemptCount = await this.prisma.quizAttempt.count({ where: { quizId, userId } });
    if (quiz.maxAttempts > 0 && attemptCount >= quiz.maxAttempts)
      throw new BadRequestException('Ya agotaste los intentos disponibles');

    let correct = 0;
    const results = answers.map(answer => {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      const correctOption = question?.options.find(o => o.isCorrect);
      const isCorrect = answer.optionId === correctOption?.id;
      if (isCorrect) correct++;
      return { questionId: answer.questionId, selectedOptionId: answer.optionId, correctOptionId: correctOption?.id ?? '', correct: isCorrect };
    });

    const score = quiz.questions.length > 0 ? (correct / quiz.questions.length) * 100 : 0;
    const passed = score >= quiz.passingScore;

    await this.prisma.quizAttempt.create({
      data: {
        userId, quizId, score, passed,
        answers: { create: answers.map(a => ({ questionId: a.questionId, optionId: a.optionId })) },
      },
    });

    return { score, passed, attemptNumber: attemptCount + 1, results };
  }

  async getMyAttempts(quizId: string, userId: string) {
    return this.prisma.quizAttempt.findMany({
      where: { quizId, userId },
      orderBy: { completedAt: 'desc' },
      select: { id: true, score: true, passed: true, completedAt: true },
    });
  }

  private validateOptions(type: string, options: OptionInput[]) {
    const correctCount = options.filter(o => o.isCorrect).length;
    if (correctCount !== 1) throw new BadRequestException('Debe haber exactamente una opción correcta');
    if (type === 'TRUE_FALSE' && options.length !== 2) throw new BadRequestException('Las preguntas V/F deben tener exactamente 2 opciones');
    if (type === 'MULTIPLE_CHOICE' && options.length < 2) throw new BadRequestException('Las preguntas de múltiple opción deben tener al menos 2 opciones');
  }
}
