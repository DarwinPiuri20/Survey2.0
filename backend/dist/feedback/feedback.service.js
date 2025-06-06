"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../common/prisma/prisma.service");
const openai_1 = require("openai");
let FeedbackService = class FeedbackService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        try {
            const apiKey = this.configService.get('OPENAI_API_KEY');
            if (apiKey) {
                this.openai = new openai_1.default({ apiKey });
            }
            else {
                console.warn('OPENAI_API_KEY no está configurada. La funcionalidad de feedback estará limitada.');
            }
        }
        catch (error) {
            console.warn('Error al inicializar OpenAI:', error);
        }
    }
    async generateFeedback(userId, generateFeedbackDto) {
        var _a;
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
            throw new common_1.NotFoundException(`Evaluación con ID ${generateFeedbackDto.evaluationId} no encontrada`);
        }
        if (evaluation.status !== 'completed') {
            throw new common_1.BadRequestException('No se puede generar feedback para una evaluación no completada');
        }
        if (evaluation.feedback) {
            throw new common_1.BadRequestException('Esta evaluación ya tiene feedback generado');
        }
        try {
            const context = this.buildPromptContext(evaluation);
            if (!this.openai) {
                throw new common_1.BadRequestException('El servicio de OpenAI no está configurado. Por favor, configure OPENAI_API_KEY en las variables de entorno.');
            }
            let rawResponse = '';
            try {
                const completion = await this.openai.chat.completions.create({
                    model: "gpt-4",
                    messages: [{ role: 'user', content: context }],
                    max_tokens: 1000,
                    temperature: 0.7,
                });
                rawResponse = ((_a = completion.choices[0].message.content) === null || _a === void 0 ? void 0 : _a.trim()) || '';
            }
            catch (error) {
                console.error('Error al generar feedback con OpenAI:', error);
                throw new common_1.BadRequestException('Error al generar feedback automático. Inténtelo de nuevo más tarde.');
            }
            const sections = this.extractFIFASections(rawResponse);
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
            await this.prisma.evaluation.update({
                where: { id: evaluation.id },
                data: { status: 'feedback_generated' },
            });
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
            return Object.assign(Object.assign({ id: feedback.id }, sections), { evaluationId: evaluation.id, sellerName: `${evaluation.seller.firstName} ${evaluation.seller.lastName}`, createdAt: feedback.createdAt });
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error al generar feedback: ${error.message}`);
        }
    }
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Feedback con ID ${id} no encontrado`);
        }
        return feedback;
    }
    async findByEvaluationId(evaluationId) {
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
            throw new common_1.NotFoundException(`Feedback para evaluación con ID ${evaluationId} no encontrado`);
        }
        return feedback;
    }
    buildPromptContext(evaluation) {
        const sellerInfo = `
    INFORMACIÓN DEL VENDEDOR:
    Nombre: ${evaluation.seller.firstName} ${evaluation.seller.lastName}
    Puntaje global: ${evaluation.totalScore ? evaluation.totalScore.toFixed(1) : 'No disponible'}
    `;
        const answersByCategory = {};
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
        let responsesSummary = '';
        for (const [category, answers] of Object.entries(answersByCategory)) {
            responsesSummary += `\n=== ${category.toUpperCase()} ===\n`;
            answers.forEach((answer) => {
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
    extractFIFASections(text) {
        const strengthsRegex = /(?:1\.\s*FORTALEZAS:|FORTALEZAS:)([\s\S]*?)(?=2\.\s*INQUIETUDES:|INQUIETUDES:|$)/i;
        const concernsRegex = /(?:2\.\s*INQUIETUDES:|INQUIETUDES:)([\s\S]*?)(?=3\.\s*FOCOS DE ATENCIÓN:|FOCOS DE ATENCIÓN:|$)/i;
        const focusPointsRegex = /(?:3\.\s*FOCOS DE ATENCIÓN:|FOCOS DE ATENCIÓN:)([\s\S]*?)(?=4\.\s*ACCIONES:|ACCIONES:|$)/i;
        const actionsRegex = /(?:4\.\s*ACCIONES:|ACCIONES:)([\s\S]*?)(?=$)/i;
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
};
exports.FeedbackService = FeedbackService;
exports.FeedbackService = FeedbackService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], FeedbackService);
//# sourceMappingURL=feedback.service.js.map