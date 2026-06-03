import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PROFESOR')
  findMine(@Request() req: any) {
    return this.coursesService.findByProfesor(req.user.userId);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAllAdmin() {
    return this.coursesService.findAllAdmin();
  }

  @Patch(':id/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  toggleActive(@Param('id') id: string) {
    return this.coursesService.toggleActive(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PROFESOR')
  create(@Body() body: { title: string; description: string; price: number; imageUrl?: string }, @Request() req: any) {
    return this.coursesService.create({ ...body, profesorId: req.user.userId });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PROFESOR')
  update(@Param('id') id: string, @Body() body: { title?: string; description?: string; price?: number; imageUrl?: string }, @Request() req: any) {
    return this.coursesService.update(id, body, req.user.userId, req.user.isAdmin);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PROFESOR')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.coursesService.remove(id, req.user.userId, req.user.isAdmin);
  }
}
