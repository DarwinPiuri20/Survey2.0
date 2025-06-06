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
exports.EvaluationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
let EvaluationsService = class EvaluationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(evaluatorId, createEvaluationDto) {
        const evaluator = await this.prisma.user.findUnique({
            where: { id: evaluatorId },
            include: { role: true },
        });
        if (!evaluator) {
            throw new common_1.NotFoundException(`Evaluador con ID ${evaluatorId} no encontrado`);
        }
        if (evaluator.role.name !== 'validator' && evaluator.role.name !== 'admin') {
            throw new common_1.ForbiddenException('Solo validadores y administradores pueden crear evaluaciones');
        }
        const seller = await this.prisma.user.findUnique({
            where: { id: createEvaluationDto.sellerId },
            include: { role: true },
        });
        if (!seller) {
            throw new common_1.NotFoundException(`Vendedor con ID ${createEvaluationDto.sellerId} no encontrado`);
        }
        if (seller.role.name !== 'seller') {
            throw new common_1.BadRequestException('Solo se pueden evaluar usuarios con rol de vendedor');
        }
        const store = await this.prisma.store.findUnique({
            where: { id: createEvaluationDto.storeId },
        });
        if (!store) {
            throw new common_1.NotFoundException(`Tienda con ID ${createEvaluationDto.storeId} no encontrada`);
        }
        if (createEvaluationDto.campaignId) {
            const campaign = await this.prisma.campaign.findUnique({
                where: { id: createEvaluationDto.campaignId },
            });
            if (!campaign) {
                throw new common_1.NotFoundException(`Campaña con ID ${createEvaluationDto.campaignId} no encontrada`);
            }
            if (!campaign.active) {
                throw new common_1.BadRequestException('La campaña no está activa');
            }
        }
        const questionIds = createEvaluationDto.answers.map(answer => answer.questionId);
        const questions = await this.prisma.question.findMany({
            where: {
                id: { in: questionIds },
                active: true,
            },
        });
        if (questions.length !== questionIds.length) {
            throw new common_1.BadRequestException('Una o más preguntas no existen o no están activas');
        }
        const numericAnswers = createEvaluationDto.answers.filter(answer => answer.numericValue !== undefined);
        let totalScore = null;
        if (numericAnswers.length > 0) {
            totalScore = numericAnswers.reduce((sum, answer) => sum + answer.numericValue, 0) / numericAnswers.length;
        }
        try {
            const evaluation = await this.prisma.$transaction(async (tx) => {
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
                await Promise.all(createEvaluationDto.answers.map((answer) => tx.answer.create({
                    data: {
                        evaluationId: newEvaluation.id,
                        questionId: answer.questionId,
                        numericValue: answer.numericValue,
                        textValue: answer.textValue,
                        booleanValue: answer.booleanValue,
                        optionValue: answer.optionValue,
                    },
                })));
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
                return newEvaluation;
            });
            return this.findOne(evaluation.id);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error al crear la evaluación: ${error.message}`);
        }
    }
    async findAll(userId, userRole, sellerId, storeId, campaignId, status, startDate, endDate, evaluatorId) {
        const filter = {};
        if (sellerId) {
            filter.sellerId = sellerId;
        }
        if (userRole === 'seller') {
            filter.sellerId = userId;
        }
        if (userRole === 'validator') {
            filter.evaluatorId = userId;
        }
        else if (evaluatorId) {
            filter.evaluatorId = evaluatorId;
        }
        if (storeId) {
            filter.storeId = storeId;
        }
        if (campaignId) {
            filter.campaignId = campaignId;
        }
        if (status) {
            filter.status = status;
        }
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) {
                filter.date.gte = new Date(startDate);
            }
            if (endDate) {
                filter.date.lte = new Date(endDate);
            }
        }
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
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Evaluación con ID ${id} no encontrada`);
        }
        return evaluation;
    }
    async update(id, userId, userRole, updateEvaluationDto) {
        const existingEvaluation = await this.prisma.evaluation.findUnique({
            where: { id },
            include: {
                evaluator: true,
            },
        });
        if (!existingEvaluation) {
            throw new common_1.NotFoundException(`Evaluación con ID ${id} no encontrada`);
        }
        if (existingEvaluation.evaluatorId !== userId &&
            userRole !== 'admin') {
            throw new common_1.ForbiddenException('No tienes permiso para modificar esta evaluación');
        }
        if (existingEvaluation.status === 'feedback_generated' &&
            userRole !== 'admin') {
            throw new common_1.BadRequestException('No se puede modificar una evaluación con feedback generado');
        }
        const updateData = {};
        if (updateEvaluationDto.sellerId) {
            const seller = await this.prisma.user.findUnique({
                where: { id: updateEvaluationDto.sellerId },
                include: { role: true },
            });
            if (!seller) {
                throw new common_1.NotFoundException(`Vendedor con ID ${updateEvaluationDto.sellerId} no encontrado`);
            }
            if (seller.role.name !== 'seller') {
                throw new common_1.BadRequestException('Solo se pueden evaluar usuarios con rol de vendedor');
            }
            updateData.sellerId = updateEvaluationDto.sellerId;
        }
        if (updateEvaluationDto.storeId) {
            const store = await this.prisma.store.findUnique({
                where: { id: updateEvaluationDto.storeId },
            });
            if (!store) {
                throw new common_1.NotFoundException(`Tienda con ID ${updateEvaluationDto.storeId} no encontrada`);
            }
            updateData.storeId = updateEvaluationDto.storeId;
        }
        if (updateEvaluationDto.campaignId) {
            const campaign = await this.prisma.campaign.findUnique({
                where: { id: updateEvaluationDto.campaignId },
            });
            if (!campaign) {
                throw new common_1.NotFoundException(`Campaña con ID ${updateEvaluationDto.campaignId} no encontrada`);
            }
            updateData.campaignId = updateEvaluationDto.campaignId;
        }
        if (updateEvaluationDto.status) {
            updateData.status = updateEvaluationDto.status;
        }
        if (updateEvaluationDto.answers && updateEvaluationDto.answers.length > 0) {
            try {
                await this.prisma.$transaction(async (tx) => {
                    await tx.answer.deleteMany({
                        where: { evaluationId: id },
                    });
                    await Promise.all(updateEvaluationDto.answers.map((answer) => tx.answer.create({
                        data: {
                            evaluationId: id,
                            questionId: answer.questionId,
                            numericValue: answer.numericValue,
                            textValue: answer.textValue,
                            booleanValue: answer.booleanValue,
                            optionValue: answer.optionValue,
                        },
                    })));
                    const numericAnswers = updateEvaluationDto.answers.filter(answer => answer.numericValue !== undefined);
                    let totalScore = null;
                    if (numericAnswers.length > 0) {
                        totalScore = numericAnswers.reduce((sum, answer) => sum + answer.numericValue, 0) / numericAnswers.length;
                        updateData.totalScore = totalScore;
                    }
                });
            }
            catch (error) {
                throw new common_1.BadRequestException(`Error al actualizar las respuestas: ${error.message}`);
            }
        }
        const updatedEvaluation = await this.prisma.evaluation.update({
            where: { id },
            data: updateData,
        });
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
        return this.findOne(id);
    }
    async remove(id, userId, userRole) {
        const evaluation = await this.prisma.evaluation.findUnique({
            where: { id },
        });
        if (!evaluation) {
            throw new common_1.NotFoundException(`Evaluación con ID ${id} no encontrada`);
        }
        if (evaluation.evaluatorId !== userId &&
            userRole !== 'admin') {
            throw new common_1.ForbiddenException('No tienes permiso para eliminar esta evaluación');
        }
        try {
            await this.prisma.$transaction(async (tx) => {
                await tx.feedback.deleteMany({
                    where: { evaluationId: id },
                });
                await tx.answer.deleteMany({
                    where: { evaluationId: id },
                });
                await tx.evaluation.delete({
                    where: { id },
                });
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
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error al eliminar la evaluación: ${error.message}`);
        }
    }
    async getSellerHistory(sellerId) {
        const seller = await this.prisma.user.findUnique({
            where: { id: sellerId },
            include: { role: true },
        });
        if (!seller) {
            throw new common_1.NotFoundException(`Vendedor con ID ${sellerId} no encontrado`);
        }
        if (seller.role.name !== 'seller') {
            throw new common_1.BadRequestException(`El usuario con ID ${sellerId} no es un vendedor`);
        }
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
        const stats = {
            totalEvaluations: evaluations.length,
            averageScore: 0,
            evaluationsByMonth: {},
            scoresByCategory: {},
        };
        if (evaluations.length > 0) {
            const totalScore = evaluations
                .filter(e => e.totalScore !== null)
                .reduce((sum, e) => sum + e.totalScore, 0);
            const countWithScore = evaluations.filter(e => e.totalScore !== null).length;
            stats.averageScore = countWithScore > 0 ? totalScore / countWithScore : 0;
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
};
exports.EvaluationsService = EvaluationsService;
exports.EvaluationsService = EvaluationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EvaluationsService);
//# sourceMappingURL=evaluations.service.js.map