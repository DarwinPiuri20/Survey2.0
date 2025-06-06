import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, ParseUUIDPipe } from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('evaluations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Post()
  @Roles('validator', 'admin')
  create(@Request() req, @Body() createEvaluationDto: CreateEvaluationDto) {
    // El ID del evaluador se obtiene del token JWT
    return this.evaluationsService.create(req.user.userId, createEvaluationDto);
  }

  @Get()
  @Roles('admin', 'validator', 'seller')
  findAll(
    @Request() req,
    @Query('sellerId') sellerId?: string,
    @Query('storeId') storeId?: string,
    @Query('campaignId') campaignId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('evaluatorId') evaluatorId?: string,
  ) {
    return this.evaluationsService.findAll(
      req.user.userId,
      req.user.role,
      sellerId,
      storeId,
      campaignId,
      status,
      startDate,
      endDate,
      evaluatorId,
    );
  }

  @Get(':id')
  @Roles('admin', 'validator', 'seller')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.evaluationsService.findOne(id);
  }

  @Patch(':id')
  @Roles('validator', 'admin')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
    @Body() updateEvaluationDto: UpdateEvaluationDto,
  ) {
    return this.evaluationsService.update(id, req.user.userId, req.user.role, updateEvaluationDto);
  }

  @Delete(':id')
  @Roles('validator', 'admin')
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.evaluationsService.remove(id, req.user.userId, req.user.role);
  }

  @Get('seller/:sellerId')
  @Roles('admin', 'validator', 'seller')
  getSellerHistory(@Param('sellerId', ParseUUIDPipe) sellerId: string, @Request() req) {
    // Si el usuario es un vendedor, solo puede ver su propio historial
    if (req.user.role === 'seller' && req.user.userId !== sellerId) {
      throw new Error('No tienes permiso para ver el historial de este vendedor');
    }
    
    return this.evaluationsService.getSellerHistory(sellerId);
  }
}
