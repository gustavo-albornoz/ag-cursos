import { Controller, Get, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getMe(@Request() req: any) {
    return this.usersService.findMe(req.user.userId);
  }

  @Patch('me/email')
  updateEmail(
    @Request() req: any,
    @Body() body: { newEmail: string; currentPassword: string },
  ) {
    return this.usersService.updateEmail(req.user.userId, body.newEmail, body.currentPassword);
  }

  @Patch('me')
  updateMe(
    @Request() req: any,
    @Body() body: { nombre?: string; apellido?: string; telefono?: string; fotoPerfil?: string },
  ) {
    return this.usersService.updateMe(req.user.userId, body);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/permissions')
  updatePermissions(
    @Param('id') id: string,
    @Body() body: { isAlumno?: boolean; isProfesor?: boolean; isAdmin?: boolean },
  ) {
    return this.usersService.updatePermissions(id, body);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
