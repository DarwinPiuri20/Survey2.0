import { Controller, Post, Get, Body, Param, UseGuards, Request, ParseUUIDPipe } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { GenerateFeedbackDto } from './dto/generate-feedback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('feedback')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('generate')
  @Roles('validator', 'admin')
  generateFeedback(@Request() req, @Body() generateFeedbackDto: GenerateFeedbackDto) {
    return this.feedbackService.generateFeedback(req.user.userId, generateFeedbackDto);
  }

  @Get(':id')
  @Roles('admin', 'validator', 'seller')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.feedbackService.findOne(id);
  }

  @Get('evaluation/:evaluationId')
  @Roles('admin', 'validator', 'seller')
  findByEvaluationId(@Param('evaluationId', ParseUUIDPipe) evaluationId: string) {
    return this.feedbackService.findByEvaluationId(evaluationId);
  }
}
