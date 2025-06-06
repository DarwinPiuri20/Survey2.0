import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { DashboardFiltersDto } from './dto/dashboard-filters.dto';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  // Obtener estadísticas generales para el dashboard principal
  async getGeneralStats(filters: DashboardFiltersDto, userRole: string, userId: string) {
    try {
      // Construir filtros de búsqueda
      const where: any = {};
      
      // Aplicar filtro de fechas
      if (filters.startDate || filters.endDate) {
        where.date = {};
        if (filters.startDate) {
          where.date.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.date.lte = new Date(filters.endDate);
        }
      }

      // Aplicar filtro de tienda
      if (filters.storeId) {
        where.storeId = filters.storeId;
      }

      // Aplicar filtro de campaña
      if (filters.campaignId) {
        where.campaignId = filters.campaignId;
      }

      // Para usuarios con rol 'seller', solo mostrar sus propias evaluaciones
      if (userRole === 'seller') {
        where.sellerId = userId;
      }

      // Para usuarios con rol 'validator', mostrar solo las evaluaciones que han realizado
      if (userRole === 'validator') {
        where.evaluatorId = userId;
      }

      // Obtener el conteo de evaluaciones
      const totalEvaluations = await this.prisma.evaluation.count({
        where,
      });

      // Obtener el promedio de puntaje
      const averageScoreResult = await this.prisma.evaluation.aggregate({
        where: {
          ...where,
          totalScore: { not: null },
        },
        _avg: {
          totalScore: true,
        },
      });

      // Obtener distribución de puntajes
      const scoreDistribution = await this.prisma.evaluation.groupBy({
        by: ['totalScore'],
        where,
        _count: {
          id: true,
        },
        orderBy: {
          totalScore: 'asc',
        },
      });

      // Obtener evaluaciones por categoría (etapas del formulario)
      const categoriesWithQuestions = await this.prisma.category.findMany({
        include: {
          questions: {
            include: {
              answers: {
                where: {
                  evaluation: {
                    ...where,
                  },
                },
              },
            },
          },
        },
        orderBy: {
          order: 'asc',
        },
      });

      // Procesar datos para obtener promedios por categoría
      const categoryAverages = categoriesWithQuestions.map(category => {
        // Obtener todas las respuestas numéricas para esta categoría
        const numericAnswers = category.questions.flatMap(question => 
          question.answers
            .filter(answer => answer.numericValue !== null && answer.numericValue !== undefined)
            .map(answer => answer.numericValue)
        );

        // Calcular promedio para esta categoría
        const averageScore = numericAnswers.length > 0
          ? numericAnswers.reduce((sum, score) => sum + score, 0) / numericAnswers.length
          : 0;

        return {
          categoryId: category.id,
          categoryName: category.name,
          averageScore: parseFloat(averageScore.toFixed(2)),
          totalAnswers: numericAnswers.length,
        };
      });

      // Obtener tendencia mensual de evaluaciones
      const monthlyTrend = await this.prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', date) as month,
          COUNT(*) as evaluationCount,
          AVG(CAST("totalScore" AS DECIMAL)) as averageScore
        FROM evaluations
        WHERE date >= DATE_TRUNC('year', CURRENT_DATE)
        GROUP BY DATE_TRUNC('month', date)
        ORDER BY month ASC
      `;

      // Retornar todas las estadísticas
      return {
        totalEvaluations,
        averageScore: averageScoreResult._avg.totalScore 
          ? parseFloat(averageScoreResult._avg.totalScore.toFixed(2)) 
          : 0,
        scoreDistribution: this.processScoreDistribution(scoreDistribution),
        categoryAverages,
        monthlyTrend,
      };
    } catch (error) {
      throw new BadRequestException(`Error al obtener estadísticas: ${error.message}`);
    }
  }

  // Obtener estadísticas detalladas para un vendedor específico
  async getSellerStats(sellerId: string, filters: DashboardFiltersDto) {
    try {
      // Verificar que el vendedor exista
      const seller = await this.prisma.user.findUnique({
        where: { id: sellerId },
        include: { role: true },
      });

      if (!seller) {
        throw new BadRequestException(`Vendedor con ID ${sellerId} no encontrado`);
      }

      // Construir filtros de búsqueda
      const where: any = { sellerId };
      
      // Aplicar filtro de fechas
      if (filters.startDate || filters.endDate) {
        where.date = {};
        if (filters.startDate) {
          where.date.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.date.lte = new Date(filters.endDate);
        }
      }

      // Aplicar filtro de tienda
      if (filters.storeId) {
        where.storeId = filters.storeId;
      }

      // Aplicar filtro de campaña
      if (filters.campaignId) {
        where.campaignId = filters.campaignId;
      }

      // Obtener evaluaciones del vendedor
      const evaluations = await this.prisma.evaluation.findMany({
        where,
        include: {
          store: true,
          campaign: true,
          evaluator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      });

      // Obtener promedio general
      const averageScore = evaluations.length > 0
        ? evaluations
            .filter(e => e.totalScore !== null && e.totalScore !== undefined)
            .reduce((sum, e) => sum + e.totalScore, 0) / evaluations.filter(e => e.totalScore !== null).length
        : 0;

      // Obtener progreso a lo largo del tiempo
      const progressByDate = evaluations
        .filter(e => e.totalScore !== null && e.totalScore !== undefined)
        .map(e => ({
          date: e.date,
          score: e.totalScore,
          storeId: e.storeId,
          storeName: e.store.name,
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      // Calcular promedios por categoría
      const categoriesWithScores = await this.getCategoryAveragesForSeller(sellerId, where);

      // Retornar estadísticas
      return {
        seller: {
          id: seller.id,
          name: `${seller.firstName} ${seller.lastName}`,
          email: seller.email,
        },
        evaluationCount: evaluations.length,
        averageScore: parseFloat(averageScore.toFixed(2)),
        progressByDate,
        categoriesWithScores,
        evaluations: evaluations.map(e => ({
          id: e.id,
          date: e.date,
          score: e.totalScore,
          store: e.store.name,
          evaluator: `${e.evaluator.firstName} ${e.evaluator.lastName}`,
          campaign: e.campaign?.name || 'N/A',
          status: e.status,
        })),
      };
    } catch (error) {
      throw new BadRequestException(`Error al obtener estadísticas del vendedor: ${error.message}`);
    }
  }

  // Obtener estadísticas por tienda
  async getStoreStats(filters: DashboardFiltersDto) {
    try {
      // Construir filtros de búsqueda
      const where: any = {};
      
      // Aplicar filtro de fechas
      if (filters.startDate || filters.endDate) {
        where.date = {};
        if (filters.startDate) {
          where.date.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.date.lte = new Date(filters.endDate);
        }
      }

      // Aplicar filtro de tienda específica
      if (filters.storeId) {
        where.storeId = filters.storeId;
      }

      // Aplicar filtro de campaña
      if (filters.campaignId) {
        where.campaignId = filters.campaignId;
      }

      // Aplicar filtro de región
      if (filters.region) {
        where.store = {
          region: filters.region,
        };
      }

      // Obtener todas las tiendas con su información
      const stores = await this.prisma.store.findMany({
        where: filters.region ? { region: filters.region } : {},
        include: {
          evaluations: {
            where,
          },
        },
      });

      // Procesar datos para obtener estadísticas por tienda
      const storeStats = stores.map(store => {
        const evaluationsCount = store.evaluations.length;
        
        // Calcular promedio de puntajes para esta tienda
        const scoresWithValues = store.evaluations
          .filter(e => e.totalScore !== null && e.totalScore !== undefined);
          
        const averageScore = scoresWithValues.length > 0
          ? scoresWithValues.reduce((sum, e) => sum + e.totalScore, 0) / scoresWithValues.length
          : 0;

        return {
          storeId: store.id,
          storeName: store.name,
          location: store.location || 'No especificada',
          region: store.region || 'No especificada',
          evaluationsCount,
          averageScore: parseFloat(averageScore.toFixed(2)),
        };
      });

      // Ordenar tiendas por promedio de puntaje (de mayor a menor)
      storeStats.sort((a, b) => b.averageScore - a.averageScore);

      // Calcular promedios regionales si no se especificó una tienda específica
      let regionAverages = [];
      if (!filters.storeId) {
        // Agrupar tiendas por región
        const storesByRegion = stores.reduce((acc, store) => {
          const region = store.region || 'Sin región';
          if (!acc[region]) {
            acc[region] = [];
          }
          acc[region].push(...store.evaluations);
          return acc;
        }, {});

        // Calcular promedio por región
        regionAverages = Object.entries(storesByRegion).map(([region, evaluations]) => {
          const evalArray = evaluations as any[];
          const scoresWithValues = evalArray.filter(e => e.totalScore !== null && e.totalScore !== undefined);
          
          const averageScore = scoresWithValues.length > 0
            ? scoresWithValues.reduce((sum, e) => sum + e.totalScore, 0) / scoresWithValues.length
            : 0;

          return {
            region,
            evaluationsCount: evalArray.length,
            averageScore: parseFloat(averageScore.toFixed(2)),
          };
        });

        // Ordenar regiones por promedio de puntaje (de mayor a menor)
        regionAverages.sort((a, b) => b.averageScore - a.averageScore);
      }

      // Retornar estadísticas
      return {
        storeStats,
        regionAverages: !filters.storeId ? regionAverages : [],
        totalStores: stores.length,
        totalRegions: !filters.storeId ? regionAverages.length : 0,
      };
    } catch (error) {
      throw new BadRequestException(`Error al obtener estadísticas de tiendas: ${error.message}`);
    }
  }

  // Obtener estadísticas para exportación y reportes
  async getExportData(filters: DashboardFiltersDto) {
    try {
      // Construir filtros de búsqueda
      const where: any = {};
      
      // Aplicar filtro de fechas
      if (filters.startDate || filters.endDate) {
        where.date = {};
        if (filters.startDate) {
          where.date.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.date.lte = new Date(filters.endDate);
        }
      }

      // Aplicar filtro de tienda
      if (filters.storeId) {
        where.storeId = filters.storeId;
      }

      // Aplicar filtro de campaña
      if (filters.campaignId) {
        where.campaignId = filters.campaignId;
      }

      // Obtener evaluaciones con todos sus datos relacionados
      const evaluations = await this.prisma.evaluation.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          evaluator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
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
        orderBy: {
          date: 'desc',
        },
      });

      // Formatear datos para exportación
      const exportData = evaluations.map(evaluation => ({
        evaluationId: evaluation.id,
        date: evaluation.date,
        seller: `${evaluation.seller.firstName} ${evaluation.seller.lastName}`,
        sellerEmail: evaluation.seller.email,
        evaluator: `${evaluation.evaluator.firstName} ${evaluation.evaluator.lastName}`,
        evaluatorEmail: evaluation.evaluator.email,
        store: evaluation.store.name,
        campaign: evaluation.campaign?.name || 'N/A',
        totalScore: evaluation.totalScore,
        status: evaluation.status,
        answers: evaluation.answers.map(answer => ({
          category: answer.question.category.name,
          question: answer.question.text,
          numericValue: answer.numericValue,
          textValue: answer.textValue,
          booleanValue: answer.booleanValue,
          optionValue: answer.optionValue,
        })),
        feedback: evaluation.feedback ? {
          strengths: evaluation.feedback.strengths,
          concerns: evaluation.feedback.concerns,
          focusPoints: evaluation.feedback.focusPoints,
          actions: evaluation.feedback.actions,
        } : null,
      }));

      // Calcular algunas estadísticas básicas
      const totalEvaluations = evaluations.length;
      const scoresWithValues = evaluations.filter(e => e.totalScore !== null && e.totalScore !== undefined);
      const averageScore = scoresWithValues.length > 0
        ? scoresWithValues.reduce((sum, e) => sum + e.totalScore, 0) / scoresWithValues.length
        : 0;

      return {
        metadata: {
          generatedAt: new Date(),
          totalEvaluations,
          averageScore: parseFloat(averageScore.toFixed(2)),
          filters: {
            startDate: filters.startDate,
            endDate: filters.endDate,
            storeId: filters.storeId,
            campaignId: filters.campaignId,
          },
        },
        data: exportData,
      };
    } catch (error) {
      throw new BadRequestException(`Error al generar datos para exportación: ${error.message}`);
    }
  }

  // Obtener estadísticas por categoría
  async getCategoryStats(filters: DashboardFiltersDto, userRole: string, userId: string) {
    try {
      // Construir filtros de búsqueda
      const where: any = {};
      
      // Aplicar filtro de fechas
      if (filters.startDate || filters.endDate) {
        where.date = {};
        if (filters.startDate) {
          where.date.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.date.lte = new Date(filters.endDate);
        }
      }

      // Aplicar filtro de tienda
      if (filters.storeId) {
        where.storeId = filters.storeId;
      }

      // Aplicar filtro de campaña
      if (filters.campaignId) {
        where.campaignId = filters.campaignId;
      }

      // Aplicar filtro de región
      if (filters.region) {
        where.store = {
          region: filters.region,
        };
      }

      // Para usuarios con rol 'seller', solo mostrar sus propias evaluaciones
      if (userRole === 'seller') {
        where.sellerId = userId;
      }

      // Para usuarios con rol 'validator', mostrar solo las evaluaciones que han realizado
      if (userRole === 'validator') {
        where.evaluatorId = userId;
      }

      // Obtener todas las categorías con sus preguntas y respuestas
      const categoriesWithQuestions = await this.prisma.category.findMany({
        include: {
          questions: {
            include: {
              answers: {
                where: {
                  evaluation: {
                    ...where,
                  },
                },
              },
            },
          },
        },
        orderBy: {
          order: 'asc',
        },
      });

      // Procesar datos para obtener promedios por categoría
      const categoryStats = categoriesWithQuestions.map(category => {
        // Obtener todas las respuestas numéricas para esta categoría
        const numericAnswers = category.questions.flatMap(question => 
          question.answers
            .filter(answer => answer.numericValue !== null && answer.numericValue !== undefined)
            .map(answer => answer.numericValue)
        );

        // Calcular promedio para esta categoría
        const score = numericAnswers.length > 0
          ? parseFloat((numericAnswers.reduce((sum, score) => sum + score, 0) / numericAnswers.length).toFixed(2))
          : 0;

        return {
          category: category.name,
          score
        };
      });

      // Ordenar por puntaje de mayor a menor
      categoryStats.sort((a, b) => b.score - a.score);

      return categoryStats;
    } catch (error) {
      throw new BadRequestException(`Error al obtener estadísticas de categorías: ${error.message}`);
    }
  }

  // Método auxiliar para procesar la distribución de puntajes
  private processScoreDistribution(scoreDistribution: any[]) {
    // Crear estructura de datos para todas las posibles puntuaciones del 1 al 5
    const processed = {
      '1': 0,
      '1.5': 0,
      '2': 0,
      '2.5': 0,
      '3': 0,
      '3.5': 0,
      '4': 0,
      '4.5': 0,
      '5': 0,
    };

    // Llenar con los datos reales
    scoreDistribution.forEach(item => {
      if (item.totalScore !== null) {
        const score = item.totalScore.toString();
        if (processed[score] !== undefined) {
          processed[score] = item._count.id;
        }
      }
    });

    // Convertir a array para facilitar el uso en gráficos
    return Object.entries(processed).map(([score, count]) => ({
      score: parseFloat(score),
      count: count,
    }));
  }

  // Método auxiliar para obtener promedios por categoría para un vendedor
  private async getCategoryAveragesForSeller(sellerId: string, additionalFilters: any = {}) {
    const where = {
      ...additionalFilters,
      sellerId,
    };

    const categoriesWithQuestions = await this.prisma.category.findMany({
      include: {
        questions: {
          include: {
            answers: {
              where: {
                evaluation: {
                  ...where,
                },
              },
            },
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    // Procesar datos para obtener promedios por categoría
    return categoriesWithQuestions.map(category => {
      // Obtener todas las respuestas numéricas para esta categoría
      const numericAnswers = category.questions.flatMap(question => 
        question.answers
          .filter(answer => answer.numericValue !== null && answer.numericValue !== undefined)
          .map(answer => answer.numericValue)
      );

      // Calcular promedio para esta categoría
      const averageScore = numericAnswers.length > 0
        ? numericAnswers.reduce((sum, score) => sum + score, 0) / numericAnswers.length
        : 0;

      return {
        categoryId: category.id,
        categoryName: category.name,
        averageScore: parseFloat(averageScore.toFixed(2)),
        totalAnswers: numericAnswers.length,
      };
    });
  }
}
