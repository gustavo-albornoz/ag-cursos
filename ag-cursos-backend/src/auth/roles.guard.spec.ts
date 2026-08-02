import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: { getAllAndOverride: jest.Mock };

  const buildContext = (user: any): ExecutionContext =>
    ({
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext);

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('permite el acceso si el endpoint no requiere roles', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(buildContext(null))).toBe(true);
  });

  it('deniega el acceso si se requieren roles pero no hay usuario en el request', () => {
    reflector.getAllAndOverride.mockReturnValue(['PROFESOR']);

    expect(guard.canActivate(buildContext(undefined))).toBe(false);
  });

  it('permite el acceso a un admin sin importar los roles requeridos', () => {
    reflector.getAllAndOverride.mockReturnValue(['PROFESOR']);

    expect(guard.canActivate(buildContext({ isAdmin: true, isProfesor: false }))).toBe(true);
  });

  it('permite el acceso a un profesor cuando se requiere PROFESOR', () => {
    reflector.getAllAndOverride.mockReturnValue(['PROFESOR']);

    expect(guard.canActivate(buildContext({ isAdmin: false, isProfesor: true }))).toBe(true);
  });

  it('deniega el acceso a un alumno cuando se requiere PROFESOR', () => {
    reflector.getAllAndOverride.mockReturnValue(['PROFESOR']);

    expect(guard.canActivate(buildContext({ isAdmin: false, isProfesor: false }))).toBe(false);
  });
});
