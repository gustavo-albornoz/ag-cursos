import { Controller, Get, Post, Put, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CourseModulesService } from './course-modules.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class CourseModulesController {
  constructor(private courseModulesService: CourseModulesService) {}

  // --- Módulos (Profesor) ---

  @UseGuards(RolesGuard) @Roles('PROFESOR')
  @Post('courses/:courseId/modules')
  create(
    @Param('courseId') courseId: string,
    @Body() body: { title: string; description?: string; videoUrl?: string; documentUrls?: string[] },
  ) {
    return this.courseModulesService.create(courseId, body);
  }

  @UseGuards(RolesGuard) @Roles('PROFESOR')
  @Patch('modules/:id')
  update(
    @Param('id') id: string,
    @Body() body: { title?: string; description?: string; videoUrl?: string; documentUrls?: string[] },
  ) {
    return this.courseModulesService.update(id, body);
  }

  @UseGuards(RolesGuard) @Roles('PROFESOR')
  @Delete('modules/:id')
  remove(@Param('id') id: string) {
    return this.courseModulesService.remove(id);
  }

  // --- Quiz (Profesor) ---

  @UseGuards(RolesGuard) @Roles('PROFESOR')
  @Get('modules/:moduleId/quiz')
  getQuiz(@Param('moduleId') moduleId: string) {
    return this.courseModulesService.getQuiz(moduleId);
  }

  @UseGuards(RolesGuard) @Roles('PROFESOR')
  @Put('modules/:moduleId/quiz')
  upsertQuiz(
    @Param('moduleId') moduleId: string,
    @Body() body: { passingScore?: number; maxAttempts?: number },
  ) {
    return this.courseModulesService.upsertQuiz(moduleId, body);
  }

  @UseGuards(RolesGuard) @Roles('PROFESOR')
  @Delete('modules/:moduleId/quiz')
  deleteQuiz(@Param('moduleId') moduleId: string) {
    return this.courseModulesService.deleteQuiz(moduleId);
  }

  // --- Preguntas (Profesor) ---

  @UseGuards(RolesGuard) @Roles('PROFESOR')
  @Post('quiz/:quizId/questions')
  addQuestion(
    @Param('quizId') quizId: string,
    @Body() body: { text: string; type: string; options: { text: string; isCorrect: boolean }[] },
  ) {
    return this.courseModulesService.addQuestion(quizId, body);
  }

  @UseGuards(RolesGuard) @Roles('PROFESOR')
  @Patch('questions/:questionId')
  updateQuestion(
    @Param('questionId') questionId: string,
    @Body() body: { text?: string; type?: string; options?: { text: string; isCorrect: boolean }[] },
  ) {
    return this.courseModulesService.updateQuestion(questionId, body);
  }

  @UseGuards(RolesGuard) @Roles('PROFESOR')
  @Delete('questions/:questionId')
  removeQuestion(@Param('questionId') questionId: string) {
    return this.courseModulesService.removeQuestion(questionId);
  }

  // --- Quiz (Alumno) ---

  @Get('modules/:moduleId/quiz/take')
  getQuizForStudent(@Param('moduleId') moduleId: string, @Request() req: any) {
    return this.courseModulesService.getQuizForStudent(moduleId, req.user.userId);
  }

  @Post('quiz/:quizId/attempt')
  submitAttempt(
    @Param('quizId') quizId: string,
    @Request() req: any,
    @Body() body: { answers: { questionId: string; optionId: string }[] },
  ) {
    return this.courseModulesService.submitAttempt(quizId, req.user.userId, body.answers);
  }

  @Get('quiz/:quizId/my-attempts')
  getMyAttempts(@Param('quizId') quizId: string, @Request() req: any) {
    return this.courseModulesService.getMyAttempts(quizId, req.user.userId);
  }
}
