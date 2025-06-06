import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { GenerateFeedbackDto } from './dto/generate-feedback.dto';
import OpenAI from 'openai';

@Injectable()
export class FeedbackService {
  private openai: OpenAI;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    try {
      // Configurar el cliente de OpenAI
      const apiKey = this.configService.get<string>('OPENAI_API_KEY');
      if (apiKey) {
        this.openai = new OpenAI({ apiKey });
      } else {
        console.warn('OPENAI_API_KEY no está configurada. La funcionalidad de feedback estará limitada.');
      }
    } catch (error) {
      console.warn('Error al inicializar OpenAI:', error);
    }
  }

  // Generar feedback automático basado en una evaluación
  async generateFeedback(userId: string, generateFeedbackDto: GenerateFeedbackDto) {
    // Verificar que la evaluación exista
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id: generateFeedbackDto.evaluationId },
      include: {
        seller: true,
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
      throw new NotFoundException(`Evaluación con ID ${generateFeedbackDto.evaluationId} no encontrada`);
    }

    // Verificar que la evaluación está completa
    if (evaluation.status !== 'completed') {
      throw new BadRequestException('No se puede generar feedback para una evaluación no completada');
    }

    // Verificar si ya existe feedback
    if (evaluation.feedback) {
      throw new BadRequestException('Esta evaluación ya tiene feedback generado');
    }

    try {
      // Construir el contexto para la generación del feedback
      const context = this.buildPromptContext(evaluation);

      // Verificar si el cliente de OpenAI está disponible
      if (!this.openai) {
        throw new BadRequestException('El servicio de OpenAI no está configurado. Por favor, configure OPENAI_API_KEY en las variables de entorno.');
      }
      
      // Declarar la variable fuera del bloque try/catch
      let rawResponse = '';
      
      try {
        // Generar el feedback utilizando OpenAI
        const completion = await this.openai.chat.completions.create({
          model: "gpt-4", // Usar GPT-4 para obtener feedback de alta calidad
          messages: [{ role: 'user', content: context }],
          max_tokens: 1000,
          temperature: 0.7,
        });

        // Procesar la respuesta de la IA
        rawResponse = completion.choices[0].message.content?.trim() || '';
      } catch (error) {
        console.error('Error al generar feedback con OpenAI:', error);
        throw new BadRequestException('Error al generar feedback automático. Inténtelo de nuevo más tarde.');
      }
      
      // Extraer las secciones del formato FIFA del texto generado
      const sections = this.extractFIFASections(rawResponse);

      // Guardar el feedback en la base de datos
      const feedback = await this.prisma.feedback.create({
        data: {
          evaluationId: evaluation.id,
          strengths: sections.strengths,
          concerns: sections.concerns,
          focusPoints: sections.focusPoints,
          actions: sections.actions,
          rawPrompt: context,
          rawResponse: rawResponse,
        },
      });

      // Actualizar el estado de la evaluación
      await this.prisma.evaluation.update({
        where: { id: evaluation.id },
        data: { status: 'feedback_generated' },
      });

      // Registrar en el log de auditoría
      await this.prisma.auditLog.create({
        data: {
          userId,
          action: 'GENERATE_FEEDBACK',
          entityType: 'FEEDBACK',
          entityId: feedback.id,
          details: { 
            evaluationId: evaluation.id,
            sellerId: evaluation.sellerId
          },
        },
      });

      return {
        id: feedback.id,
        ...sections,
        evaluationId: evaluation.id,
        sellerName: `${evaluation.seller.firstName} ${evaluation.seller.lastName}`,
        createdAt: feedback.createdAt,
      };
    } catch (error) {
      throw new BadRequestException(`Error al generar feedback: ${error.message}`);
    }
  }

  // Obtener feedback por ID
  async findOne(id: string) {
    const feedback = await this.prisma.feedback.findUnique({
      where: { id },
      include: {
        evaluation: {
          include: {
            seller: true,
            evaluator: true,
            store: true,
          },
        },
      },
    });

    if (!feedback) {
      throw new NotFoundException(`Feedback con ID ${id} no encontrado`);
    }

    return feedback;
  }

  // Obtener feedback por ID de evaluación
  async findByEvaluationId(evaluationId: string) {
    const feedback = await this.prisma.feedback.findUnique({
      where: { evaluationId },
      include: {
        evaluation: {
          include: {
            seller: true,
            evaluator: true,
            store: true,
          },
        },
      },
    });

    if (!feedback) {
      throw new NotFoundException(`Feedback para evaluación con ID ${evaluationId} no encontrado`);
    }

    return feedback;
  }

  // Construir el contexto para el prompt de OpenAI
  private buildPromptContext(evaluation: any): string {
    // Información general sobre el vendedor
    const sellerInfo = `
    INFORMACIÓN DEL VENDEDOR:
    Nombre: ${evaluation.seller.firstName} ${evaluation.seller.lastName}
    Puntaje global: ${evaluation.totalScore ? evaluation.totalScore.toFixed(1) : 'No disponible'}
    `;

    // Organizar las respuestas por categorías
    const answersByCategory: any = {};
    
    evaluation.answers.forEach(answer => {
      const categoryName = answer.question.category.name;
      
      if (!answersByCategory[categoryName]) {
        answersByCategory[categoryName] = [];
      }
      
      answersByCategory[categoryName].push({
        question: answer.question.text,
        numericValue: answer.numericValue,
        textValue: answer.textValue,
        booleanValue: answer.booleanValue,
        optionValue: answer.optionValue,
      });
    });

    // Construir el resumen de respuestas por categoría
    let responsesSummary = '';
    
    for (const [category, answers] of Object.entries(answersByCategory)) {
      responsesSummary += `\n=== ${category.toUpperCase()} ===\n`;
      
      (answers as any[]).forEach((answer: any) => {
        responsesSummary += `Pregunta: ${answer.question}\n`;
        
        if (answer.numericValue !== null && answer.numericValue !== undefined) {
          responsesSummary += `Puntaje: ${answer.numericValue}/5\n`;
        }
        
        if (answer.textValue) {
          responsesSummary += `Observación: ${answer.textValue}\n`;
        }
        
        if (answer.booleanValue !== null && answer.booleanValue !== undefined) {
          responsesSummary += `Respuesta: ${answer.booleanValue ? 'Sí' : 'No'}\n`;
        }
        
        if (answer.optionValue) {
          responsesSummary += `Opción seleccionada: ${answer.optionValue}\n`;
        }
        
        responsesSummary += '\n';
      });
    }

    // Construir el prompt completo
    return `
    Eres un experto en coaching de ventas para vendedores de retail. A continuación, te proporcionaré información sobre una evaluación de desempeño de un vendedor. Tu tarea es generar una retroalimentación constructiva siguiendo el modelo FIFA (Fortalezas, Inquietudes, Focos de atención, Acciones).

    ${sellerInfo}

    RESULTADOS DE LA EVALUACIÓN:
    ${responsesSummary}

    INSTRUCCIONES:
    Basa tu análisis en las puntuaciones numéricas y comentarios proporcionados.
    Organiza tu retroalimentación en el siguiente formato FIFA:

    1. FORTALEZAS:
    • Lista 3-4 aspectos positivos destacables del desempeño del vendedor.
    • Sé específico y menciona ejemplos concretos de las áreas donde el vendedor mostró excelencia.

    2. INQUIETUDES:
    • Identifica 2-3 áreas problemáticas o de preocupación.
    • Expresa las inquietudes de manera constructiva, no crítica.

    3. FOCOS DE ATENCIÓN:
    • Señala 2-3 áreas específicas donde el vendedor debería concentrar sus esfuerzos para mejorar.
    • Explica por qué estas áreas son prioritarias.

    4. ACCIONES:
    • Proporciona 3-4 acciones concretas y realizables que el vendedor puede implementar inmediatamente.
    • Las acciones deben ser específicas, medibles y orientadas a resultados.

    Respuesta:
    `;
  }

  // Extraer las secciones del formato FIFA del texto generado
  private extractFIFASections(text: string): {
    strengths: string;
    concerns: string;
    focusPoints: string;
    actions: string;
  } {
    // Expresiones regulares para identificar cada sección
    const strengthsRegex = /(?:1\.\s*FORTALEZAS:|FORTALEZAS:)([\s\S]*?)(?=2\.\s*INQUIETUDES:|INQUIETUDES:|$)/i;
    const concernsRegex = /(?:2\.\s*INQUIETUDES:|INQUIETUDES:)([\s\S]*?)(?=3\.\s*FOCOS DE ATENCIÓN:|FOCOS DE ATENCIÓN:|$)/i;
    const focusPointsRegex = /(?:3\.\s*FOCOS DE ATENCIÓN:|FOCOS DE ATENCIÓN:)([\s\S]*?)(?=4\.\s*ACCIONES:|ACCIONES:|$)/i;
    const actionsRegex = /(?:4\.\s*ACCIONES:|ACCIONES:)([\s\S]*?)(?=$)/i;

    // Extraer las secciones usando las expresiones regulares
    const strengthsMatch = text.match(strengthsRegex);
    const concernsMatch = text.match(concernsRegex);
    const focusPointsMatch = text.match(focusPointsRegex);
    const actionsMatch = text.match(actionsRegex);

    return {
      strengths: strengthsMatch ? strengthsMatch[1].trim() : 'No se pudo extraer las fortalezas.',
      concerns: concernsMatch ? concernsMatch[1].trim() : 'No se pudo extraer las inquietudes.',
      focusPoints: focusPointsMatch ? focusPointsMatch[1].trim() : 'No se pudo extraer los focos de atención.',
      actions: actionsMatch ? actionsMatch[1].trim() : 'No se pudo extraer las acciones.',
    };
  }
}
