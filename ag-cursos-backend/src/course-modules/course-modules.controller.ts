import { Controller, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CourseModulesService } from './course-modules.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PROFESOR')
export class CourseModulesController {
  constructor(private courseModulesService: CourseModulesService) {}

  @Post('courses/:courseId/modules')
  create(
    @Param('courseId') courseId: string,
    @Body() body: { title: string; description?: string; videoUrl?: string; documentUrls?: string[] },
  ) {
    return this.courseModulesService.create(courseId, body);
  }

  @Patch('modules/:id')
  update(
    @Param('id') id: string,
    @Body() body: { title?: string; description?: string; videoUrl?: string; documentUrls?: string[] },
  ) {
    return this.courseModulesService.update(id, body);
  }

  @Delete('modules/:id')
  remove(@Param('id') id: string) {
    return this.courseModulesService.remove(id);
  }
}
