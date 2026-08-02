import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: jest.Mock; create: jest.Mock; update: jest.Mock } };
  let jwt: { sign: jest.Mock };

  const baseUser = {
    id: 'user-1',
    email: 'alumno@test.com',
    password: 'hashed-password',
    isAlumno: true,
    isProfesor: false,
    isAdmin: false,
    sessionId: null as string | null,
  };

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    };
    jwt = { sign: jest.fn().mockReturnValue('signed-jwt') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('lanza ConflictException si el email ya existe', async () => {
      prisma.user.findUnique.mockResolvedValue(baseUser);

      await expect(service.register(baseUser.email, 'pass123')).rejects.toThrow(ConflictException);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('crea el usuario con password hasheada y devuelve el token', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      prisma.user.create.mockResolvedValue(baseUser);

      const result = await service.register(baseUser.email, 'pass123');

      expect(bcrypt.hash).toHaveBeenCalledWith('pass123', 10);
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ email: baseUser.email, password: 'hashed-password', isAlumno: true }),
        }),
      );
      expect(result.access_token).toBe('signed-jwt');
      expect(result.user).toEqual({
        id: baseUser.id,
        email: baseUser.email,
        isAlumno: true,
        isProfesor: false,
        isAdmin: false,
      });
    });
  });

  describe('login', () => {
    it('lanza UnauthorizedException si el usuario no existe', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login('nadie@test.com', 'pass')).rejects.toThrow(UnauthorizedException);
    });

    it('lanza UnauthorizedException si la password no coincide', async () => {
      prisma.user.findUnique.mockResolvedValue(baseUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(baseUser.email, 'wrong')).rejects.toThrow(UnauthorizedException);
    });

    it('lanza ConflictException si ya hay una sesion activa y no se fuerza', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...baseUser, sessionId: 'otra-sesion' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.login(baseUser.email, 'pass123')).rejects.toThrow(ConflictException);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('permite loguear con sesion activa cuando force=true', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...baseUser, sessionId: 'otra-sesion' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prisma.user.update.mockResolvedValue({ ...baseUser, sessionId: 'nueva-sesion' });

      const result = await service.login(baseUser.email, 'pass123', true);

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: baseUser.id } }),
      );
      expect(result.access_token).toBe('signed-jwt');
    });

    it('loguea normalmente cuando no hay sesion previa', async () => {
      prisma.user.findUnique.mockResolvedValue(baseUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prisma.user.update.mockResolvedValue({ ...baseUser, sessionId: 'nueva-sesion' });

      const result = await service.login(baseUser.email, 'pass123');

      expect(result.access_token).toBe('signed-jwt');
    });
  });

  describe('logout', () => {
    it('limpia el sessionId del usuario', async () => {
      prisma.user.update.mockResolvedValue({ ...baseUser, sessionId: null });

      const result = await service.logout(baseUser.id);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: baseUser.id },
        data: { sessionId: null },
      });
      expect(result).toEqual({ success: true });
    });
  });
});
