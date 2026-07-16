import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(email: string, password: string) {
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new ConflictException('El email ya está registrado');

    const hash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email, password: hash, isAlumno: true, isProfesor: false, isAdmin: false, sessionId: randomUUID() },
    });

    return this.generateToken(user);
  }

  async login(email: string, password: string, force = false) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    if (user.sessionId && !force) {
      throw new ConflictException('Ya hay una sesión activa en otro dispositivo');
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { sessionId: randomUUID() },
    });

    return this.generateToken(updated);
  }

  async logout(userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { sessionId: null } });
    return { success: true };
  }

  private generateToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      isAlumno: user.isAlumno,
      isProfesor: user.isProfesor,
      isAdmin: user.isAdmin,
      sessionId: user.sessionId,
    };
    return {
      access_token: this.jwt.sign(payload),
      user: { id: user.id, email: user.email, isAlumno: user.isAlumno, isProfesor: user.isProfesor, isAdmin: user.isAdmin },
    };
  }
}
