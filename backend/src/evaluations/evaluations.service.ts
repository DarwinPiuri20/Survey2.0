import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';

@Injectable()
export class EvaluationsService {
  constructor(private prisma: PrismaService) {}

  // Crear una nueva evaluación
  async create(evaluatorId: string, createEvaluationDto: CreateEvaluationDto) {
    // Verificar que el evaluador exista
    const evaluator = await this.prisma.user.findUnique({
      where: { id: evaluatorId },
      include: { role: true },
    });

    if (!evaluator) {
      throw new NotFoundException(`Evaluador con ID ${evaluatorId} no encontrado`);
    }

    // Verificar que el evaluador tenga rol de validator
    if (evaluator.role.name !== 'validator' && evaluator.role.name !== 'admin') {
      throw new ForbiddenException('Solo validadores y administradores pueden crear evaluaciones');
    }

    // Verificar que el vendedor exista
    const seller = await this.prisma.user.findUnique({
      where: { id: createEvaluationDto.sellerId },
      include: { role: true },
    });

    if (!seller) {
      throw new NotFoundException(`Vendedor con ID ${createEvaluationDto.sellerId} no encontrado`);
    }

    // Verificar que el usuario a evaluar tenga rol de seller
    if (seller.role.name !== 'seller') {
      throw new BadRequestException('Solo se pueden evaluar usuarios con rol de vendedor');
    }

    // Verificar que la tienda exista
    const store = await this.prisma.store.findUnique({
      where: { id: createEvaluationDto.storeId },
    });

    if (!store) {
      throw new NotFoundException(`Tienda con ID ${createEvaluationDto.storeId} no encontrada`);
    }

    // Verificar campaña si se proporciona
    if (createEvaluationDto.campaignId) {
      const campaign = await this.prisma.campaign.findUnique({
        where: { id: createEvaluationDto.campaignId },
      });

      if (!campaign) {
        throw new NotFoundException(`Campaña con ID ${createEvaluationDto.campaignId} no encontrada`);
      }

      if (!campaign.active) {
        throw new BadRequestException('La campaña no está activa');
      }
    }

    // Verificar que todas las preguntas existan
    const questionIds = createEvaluationDto.answers.map(answer => answer.questionId);
    const questions = await this.prisma.question.findMany({
      where: {
        id: { in: questionIds },
        active: true,
      },
    });

    if (questions.length !== questionIds.length) {
      throw new BadRequestException('Una o más preguntas no existen o no están activas');
    }

    // Calcular puntaje promedio de las respuestas numéricas
    const numericAnswers = createEvaluationDto.answers.filter(answer => answer.numericValue !== undefined);
    let totalScore = null;
    
    if (numericAnswers.length > 0) {
      totalScore = numericAnswers.reduce((sum, answer) => sum + answer.numericValue, 0) / numericAnswers.length;
    }

    // Crear la evaluación con sus respuestas usando transacción
    try {
      const evaluation = await this.prisma.$transaction(async (tx) => {
        // Crear la evaluación
        const newEvaluation = await tx.evaluation.create({
          data: {
            evaluatorId,
            sellerId: createEvaluationDto.sellerId,
            storeId: createEvaluationDto.storeId,
            campaignId: createEvaluationDto.campaignId,
            totalScore,
            status: 'draft',
          },
        });

        // Crear las respuestas asociadas
        await Promise.all(
          createEvaluationDto.answers.map((answer) =>
            tx.answer.create({
              data: {
                evaluationId: newEvaluation.id,
                questionId: answer.questionId,
                numericValue: answer.numericValue,
                textValue: answer.textValue,
                booleanValue: answer.booleanValue,
                optionValue: answer.optionValue,
              },
            }),
          ),
        );

        // Registrar la acción en el log de auditoría
        await tx.auditLog.create({
          data: {
            userId: evaluatorId,
            action: 'CREATE_EVALUATION',
            entityType: 'EVALUATION',
            entityId: newEvaluation.id,
            details: { 
              sellerId: createEvaluationDto.sellerId,
              storeId: createEvaluationDto.storeId,
              totalScore,
            },
          },
        });

        // Devolver la evaluación creada
        return newEvaluation;
      });

      // Obtener la evaluación completa con todas sus relaciones
      return this.findOne(evaluation.id);
    } catch (error) {
      throw new BadRequestException(`Error al crear la evaluación: ${error.message}`);
    }
  }

  // Obtener todas las evaluaciones con filtros
  async findAll(
    userId: string,
    userRole: string,
    sellerId?: string,
    storeId?: string,
    campaignId?: string,
    status?: string,
    startDate?: Date,
    endDate?: Date,
    evaluatorId?: string,
  ) {
    // Construir los filtros de búsqueda
    const filter: any = {};

    // Filtrar por vendedor
    if (sellerId) {
      filter.sellerId = sellerId;
    }

    // Para usuarios con rol 'seller', solo mostrar sus propias evaluaciones
    if (userRole === 'seller') {
      filter.sellerId = userId;
    }

    // Para usuarios con rol 'validator', mostrar solo las evaluaciones que han realizado
    if (userRole === 'validator') {
      filter.evaluatorId = userId;
    } else if (evaluatorId) {
      // Si se proporciona un evaluatorId específico (y el usuario no es validator)
      filter.evaluatorId = evaluatorId;
    }

    // Aplicar filtros adicionales si se proporcionan
    if (storeId) {
      filter.storeId = storeId;
    }

    if (campaignId) {
      filter.campaignId = campaignId;
    }

    if (status) {
      filter.status = status;
    }

    // Filtrar por rango de fechas
    if (startDate || endDate) {
      filter.date = {};

      if (startDate) {
        filter.date.gte = new Date(startDate);
      }

      if (endDate) {
        filter.date.lte = new Date(endDate);
      }
    }

    // Obtener evaluaciones con los filtros aplicados
    const evaluations = await this.prisma.evaluation.findMany({
      where: filter,
      include: {
        evaluator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        seller: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        store: true,
        campaign: true,
        feedback: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return evaluations;
  }

  // Obtener una evaluación por ID
  async findOne(id: string) {
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id },
      include: {
        evaluator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        seller: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        store: true,
        campaign: true,
        answers: {
          include: {
            question: {
              include: {
                category: true,
              },
            },
          },
        },
        feedback: true,
      },
    });

    if (!evaluation) {
      throw new NotFoundException(`Evaluación con ID ${id} no encontrada`);
    }

    return evaluation;
  }

  // Actualizar una evaluación
  async update(id: string, userId: string, userRole: string, updateEvaluationDto: UpdateEvaluationDto) {
    // Verificar que la evaluación exista
    const existingEvaluation = await this.prisma.evaluation.findUnique({
      where: { id },
      include: {
        evaluator: true,
      },
    });

    if (!existingEvaluation) {
      throw new NotFoundException(`Evaluación con ID ${id} no encontrada`);
    }

    // Solo el evaluador original o un admin pueden modificar una evaluación
    if (
      existingEvaluation.evaluatorId !== userId && 
      userRole !== 'admin'
    ) {
      throw new ForbiddenException('No tienes permiso para modificar esta evaluación');
    }

    // No permitir modificaciones si ya se generó feedback (a menos que sea admin)
    if (
      existingEvaluation.status === 'feedback_generated' && 
      userRole !== 'admin'
    ) {
      throw new BadRequestException('No se puede modificar una evaluación con feedback generado');
    }

    // Preparar los datos para actualizar
    const updateData: any = {};
    
    // Actualizar relaciones solo si se proporcionan los IDs correspondientes
    if (updateEvaluationDto.sellerId) {
      // Verificar que el vendedor exista y tenga rol de seller
      const seller = await this.prisma.user.findUnique({
        where: { id: updateEvaluationDto.sellerId },
        include: { role: true },
      });

      if (!seller) {
        throw new NotFoundException(`Vendedor con ID ${updateEvaluationDto.sellerId} no encontrado`);
      }

      if (seller.role.name !== 'seller') {
        throw new BadRequestException('Solo se pueden evaluar usuarios con rol de vendedor');
      }

      updateData.sellerId = updateEvaluationDto.sellerId;
    }

    if (updateEvaluationDto.storeId) {
      // Verificar que la tienda exista
      const store = await this.prisma.store.findUnique({
        where: { id: updateEvaluationDto.storeId },
      });

      if (!store) {
        throw new NotFoundException(`Tienda con ID ${updateEvaluationDto.storeId} no encontrada`);
      }

      updateData.storeId = updateEvaluationDto.storeId;
    }

    if (updateEvaluationDto.campaignId) {
      // Verificar que la campaña exista
      const campaign = await this.prisma.campaign.findUnique({
        where: { id: updateEvaluationDto.campaignId },
      });

      if (!campaign) {
        throw new NotFoundException(`Campaña con ID ${updateEvaluationDto.campaignId} no encontrada`);
      }

      updateData.campaignId = updateEvaluationDto.campaignId;
    }

    // Actualizar estado si se proporciona
    if (updateEvaluationDto.status) {
      updateData.status = updateEvaluationDto.status;
    }

    // Si se proporcionan respuestas, actualizarlas
    if (updateEvaluationDto.answers && updateEvaluationDto.answers.length > 0) {
      try {
        // Usar transacción para garantizar la consistencia
        await this.prisma.$transaction(async (tx) => {
          // Eliminar respuestas existentes
          await tx.answer.deleteMany({
            where: { evaluationId: id },
          });

          // Crear nuevas respuestas
          await Promise.all(
            updateEvaluationDto.answers.map((answer) =>
              tx.answer.create({
                data: {
                  evaluationId: id,
                  questionId: answer.questionId,
                  numericValue: answer.numericValue,
                  textValue: answer.textValue,
                  booleanValue: answer.booleanValue,
                  optionValue: answer.optionValue,
                },
              }),
            ),
          );

          // Recalcular puntaje promedio
          const numericAnswers = updateEvaluationDto.answers.filter(answer => answer.numericValue !== undefined);
          let totalScore = null;
          
          if (numericAnswers.length > 0) {
            totalScore = numericAnswers.reduce((sum, answer) => sum + answer.numericValue, 0) / numericAnswers.length;
            updateData.totalScore = totalScore;
          }
        });
      } catch (error) {
        throw new BadRequestException(`Error al actualizar las respuestas: ${error.message}`);
      }
    }

    // Actualizar la evaluación
    const updatedEvaluation = await this.prisma.evaluation.update({
      where: { id },
      data: updateData,
    });

    // Registrar la acción en el log de auditoría
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE_EVALUATION',
        entityType: 'EVALUATION',
        entityId: id,
        details: { 
          updatedFields: Object.keys(updateData)
        },
      },
    });

    // Retornar la evaluación actualizada con todas sus relaciones
    return this.findOne(id);
  }

  // Eliminar una evaluación
  async remove(id: string, userId: string, userRole: string) {
    // Verificar que la evaluación exista
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id },
    });

    if (!evaluation) {
      throw new NotFoundException(`Evaluación con ID ${id} no encontrada`);
    }

    // Solo el evaluador original o un admin pueden eliminar una evaluación
    if (
      evaluation.evaluatorId !== userId && 
      userRole !== 'admin'
    ) {
      throw new ForbiddenException('No tienes permiso para eliminar esta evaluación');
    }

    try {
      // Eliminar usando transacción para garantizar integridad
      await this.prisma.$transaction(async (tx) => {
        // Eliminar feedback si existe
        await tx.feedback.deleteMany({
          where: { evaluationId: id },
        });

        // Eliminar respuestas
        await tx.answer.deleteMany({
          where: { evaluationId: id },
        });

        // Eliminar la evaluación
        await tx.evaluation.delete({
          where: { id },
        });

        // Registrar la acción en el log de auditoría
        await tx.auditLog.create({
          data: {
            userId,
            action: 'DELETE_EVALUATION',
            entityType: 'EVALUATION',
            entityId: id,
            details: { 
              sellerId: evaluation.sellerId,
              date: evaluation.date
            },
          },
        });
      });

      return { 
        message: `Evaluación con ID ${id} eliminada correctamente` 
      };
    } catch (error) {
      throw new BadRequestException(`Error al eliminar la evaluación: ${error.message}`);
    }
  }

  // Método para consultar el historial de evaluaciones de un vendedor
  async getSellerHistory(sellerId: string) {
    // Verificar que el vendedor exista
    const seller = await this.prisma.user.findUnique({
      where: { id: sellerId },
      include: { role: true },
    });

    if (!seller) {
      throw new NotFoundException(`Vendedor con ID ${sellerId} no encontrado`);
    }

    if (seller.role.name !== 'seller') {
      throw new BadRequestException(`El usuario con ID ${sellerId} no es un vendedor`);
    }

    // Obtener todas las evaluaciones del vendedor
    const evaluations = await this.prisma.evaluation.findMany({
      where: { sellerId },
      include: {
        evaluator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        store: true,
        campaign: true,
        feedback: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Calcular estadísticas
    const stats = {
      totalEvaluations: evaluations.length,
      averageScore: 0,
      evaluationsByMonth: {},
      scoresByCategory: {},
    };

    if (evaluations.length > 0) {
      // Calcular puntaje promedio
      const totalScore = evaluations
        .filter(e => e.totalScore !== null)
        .reduce((sum, e) => sum + e.totalScore, 0);
      
      const countWithScore = evaluations.filter(e => e.totalScore !== null).length;
      stats.averageScore = countWithScore > 0 ? totalScore / countWithScore : 0;

      // Agrupar por mes
      evaluations.forEach(e => {
        const monthYear = `${e.date.getMonth() + 1}/${e.date.getFullYear()}`;
        if (!stats.evaluationsByMonth[monthYear]) {
          stats.evaluationsByMonth[monthYear] = 0;
        }
        stats.evaluationsByMonth[monthYear]++;
      });
    }

    return {
      seller: {
        id: seller.id,
        firstName: seller.firstName,
        lastName: seller.lastName,
        email: seller.email,
      },
      stats,
      evaluations
    };
  }
}
