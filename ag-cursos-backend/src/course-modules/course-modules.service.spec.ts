import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CourseModulesService } from './course-modules.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CourseModulesService', () => {
  let service: CourseModulesService;
  let prisma: {
    question: { count: jest.Mock; create: jest.Mock; findUnique: jest.Mock; update: jest.Mock; delete: jest.Mock };
    option: { deleteMany: jest.Mock };
    quiz: { findUnique: jest.Mock };
    quizAttempt: { count: jest.Mock; create: jest.Mock; findMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      question: { count: jest.fn(), create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn() },
      option: { deleteMany: jest.fn() },
      quiz: { findUnique: jest.fn() },
      quizAttempt: { count: jest.fn(), create: jest.fn(), findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseModulesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(CourseModulesService);
  });

  describe('addQuestion / validateOptions', () => {
    it('rechaza una pregunta sin ninguna opcion correcta', async () => {
      const data = { text: '¿2+2?', type: 'MULTIPLE_CHOICE', options: [{ text: '3', isCorrect: false }, { text: '4', isCorrect: false }] };

      await expect(service.addQuestion('quiz-1', data)).rejects.toThrow(BadRequestException);
      expect(prisma.question.create).not.toHaveBeenCalled();
    });

    it('rechaza una pregunta con mas de una opcion correcta', async () => {
      const data = { text: '¿2+2?', type: 'MULTIPLE_CHOICE', options: [{ text: '4', isCorrect: true }, { text: '5', isCorrect: true }] };

      await expect(service.addQuestion('quiz-1', data)).rejects.toThrow(BadRequestException);
    });

    it('rechaza V/F sin exactamente 2 opciones', async () => {
      const data = { text: '¿Es verdad?', type: 'TRUE_FALSE', options: [{ text: 'Verdadero', isCorrect: true }] };

      await expect(service.addQuestion('quiz-1', data)).rejects.toThrow(BadRequestException);
    });

    it('rechaza multiple choice con menos de 2 opciones', async () => {
      const data = { text: '¿Cual es?', type: 'MULTIPLE_CHOICE', options: [{ text: 'Unica', isCorrect: true }] };

      await expect(service.addQuestion('quiz-1', data)).rejects.toThrow(BadRequestException);
    });

    it('crea la pregunta con el order siguiente cuando las opciones son validas', async () => {
      const data = {
        text: '¿Capital de Francia?',
        type: 'MULTIPLE_CHOICE',
        options: [
          { text: 'Paris', isCorrect: true },
          { text: 'Roma', isCorrect: false },
        ],
      };
      prisma.question.count.mockResolvedValue(2);
      prisma.question.create.mockResolvedValue({ id: 'q-1', ...data, order: 3 });

      await service.addQuestion('quiz-1', data);

      expect(prisma.question.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ quizId: 'quiz-1', order: 3, options: { create: data.options } }),
        }),
      );
    });
  });

  describe('submitAttempt', () => {
    const quiz = {
      id: 'quiz-1',
      passingScore: 60,
      maxAttempts: 2,
      questions: [
        {
          id: 'q1',
          options: [
            { id: 'o1', isCorrect: true },
            { id: 'o2', isCorrect: false },
          ],
        },
        {
          id: 'q2',
          options: [
            { id: 'o3', isCorrect: false },
            { id: 'o4', isCorrect: true },
          ],
        },
      ],
    };

    it('lanza NotFoundException si el quiz no existe', async () => {
      prisma.quiz.findUnique.mockResolvedValue(null);

      await expect(service.submitAttempt('quiz-x', 'user-1', [])).rejects.toThrow(NotFoundException);
    });

    it('lanza BadRequestException si ya se agotaron los intentos', async () => {
      prisma.quiz.findUnique.mockResolvedValue(quiz);
      prisma.quizAttempt.count.mockResolvedValue(2);

      await expect(service.submitAttempt('quiz-1', 'user-1', [])).rejects.toThrow(BadRequestException);
      expect(prisma.quizAttempt.create).not.toHaveBeenCalled();
    });

    it('permite intentos ilimitados cuando maxAttempts es 0', async () => {
      prisma.quiz.findUnique.mockResolvedValue({ ...quiz, maxAttempts: 0 });
      prisma.quizAttempt.count.mockResolvedValue(50);
      prisma.quizAttempt.create.mockResolvedValue({});

      const result = await service.submitAttempt('quiz-1', 'user-1', [
        { questionId: 'q1', optionId: 'o1' },
        { questionId: 'q2', optionId: 'o4' },
      ]);

      expect(result.score).toBe(100);
    });

    it('calcula el score y determina passed correctamente', async () => {
      prisma.quiz.findUnique.mockResolvedValue(quiz);
      prisma.quizAttempt.count.mockResolvedValue(0);
      prisma.quizAttempt.create.mockResolvedValue({});

      const result = await service.submitAttempt('quiz-1', 'user-1', [
        { questionId: 'q1', optionId: 'o1' },
        { questionId: 'q2', optionId: 'o3' },
      ]);

      expect(result.score).toBe(50);
      expect(result.passed).toBe(false);
      expect(result.attemptNumber).toBe(1);
      expect(result.results).toEqual([
        { questionId: 'q1', selectedOptionId: 'o1', correctOptionId: 'o1', correct: true },
        { questionId: 'q2', selectedOptionId: 'o3', correctOptionId: 'o4', correct: false },
      ]);
    });

    it('marca passed=true cuando el score alcanza el passingScore', async () => {
      prisma.quiz.findUnique.mockResolvedValue(quiz);
      prisma.quizAttempt.count.mockResolvedValue(0);
      prisma.quizAttempt.create.mockResolvedValue({});

      const result = await service.submitAttempt('quiz-1', 'user-1', [
        { questionId: 'q1', optionId: 'o1' },
        { questionId: 'q2', optionId: 'o4' },
      ]);

      expect(result.score).toBe(100);
      expect(result.passed).toBe(true);
    });
  });

  describe('getQuizForStudent', () => {
    it('devuelve null si el modulo no tiene quiz', async () => {
      prisma.quiz.findUnique.mockResolvedValue(null);

      const result = await service.getQuizForStudent('module-1', 'user-1');

      expect(result).toBeNull();
      expect(prisma.quizAttempt.count).not.toHaveBeenCalled();
    });

    it('canAttempt=false cuando se agotaron los intentos', async () => {
      prisma.quiz.findUnique.mockResolvedValue({ id: 'quiz-1', maxAttempts: 2, questions: [] });
      prisma.quizAttempt.count.mockResolvedValue(2);

      const result = await service.getQuizForStudent('module-1', 'user-1');

      expect(result?.canAttempt).toBe(false);
    });

    it('canAttempt=true cuando maxAttempts es 0 (ilimitado)', async () => {
      prisma.quiz.findUnique.mockResolvedValue({ id: 'quiz-1', maxAttempts: 0, questions: [] });
      prisma.quizAttempt.count.mockResolvedValue(100);

      const result = await service.getQuizForStudent('module-1', 'user-1');

      expect(result?.canAttempt).toBe(true);
    });
  });
});
