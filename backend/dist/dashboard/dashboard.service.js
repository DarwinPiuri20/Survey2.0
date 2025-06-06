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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getGeneralStats(filters, userRole, userId) {
        try {
            const where = {};
            if (filters.startDate || filters.endDate) {
                where.date = {};
                if (filters.startDate) {
                    where.date.gte = new Date(filters.startDate);
                }
                if (filters.endDate) {
                    where.date.lte = new Date(filters.endDate);
                }
            }
            if (filters.storeId) {
                where.storeId = filters.storeId;
            }
            if (filters.campaignId) {
                where.campaignId = filters.campaignId;
            }
            if (userRole === 'seller') {
                where.sellerId = userId;
            }
            if (userRole === 'validator') {
                where.evaluatorId = userId;
            }
            const totalEvaluations = await this.prisma.evaluation.count({
                where,
            });
            const averageScoreResult = await this.prisma.evaluation.aggregate({
                where: Object.assign(Object.assign({}, where), { totalScore: { not: null } }),
                _avg: {
                    totalScore: true,
                },
            });
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
            const categoriesWithQuestions = await this.prisma.category.findMany({
                include: {
                    questions: {
                        include: {
                            answers: {
                                where: {
                                    evaluation: Object.assign({}, where),
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    order: 'asc',
                },
            });
            const categoryAverages = categoriesWithQuestions.map(category => {
                const numericAnswers = category.questions.flatMap(question => question.answers
                    .filter(answer => answer.numericValue !== null && answer.numericValue !== undefined)
                    .map(answer => answer.numericValue));
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
            const monthlyTrend = await this.prisma.$queryRaw `
        SELECT 
          DATE_TRUNC('month', date) as month,
          COUNT(*) as evaluationCount,
          AVG(CAST("totalScore" AS DECIMAL)) as averageScore
        FROM evaluations
        WHERE date >= DATE_TRUNC('year', CURRENT_DATE)
        GROUP BY DATE_TRUNC('month', date)
        ORDER BY month ASC
      `;
            return {
                totalEvaluations,
                averageScore: averageScoreResult._avg.totalScore
                    ? parseFloat(averageScoreResult._avg.totalScore.toFixed(2))
                    : 0,
                scoreDistribution: this.processScoreDistribution(scoreDistribution),
                categoryAverages,
                monthlyTrend,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error al obtener estadísticas: ${error.message}`);
        }
    }
    async getSellerStats(sellerId, filters) {
        try {
            const seller = await this.prisma.user.findUnique({
                where: { id: sellerId },
                include: { role: true },
            });
            if (!seller) {
                throw new common_1.BadRequestException(`Vendedor con ID ${sellerId} no encontrado`);
            }
            const where = { sellerId };
            if (filters.startDate || filters.endDate) {
                where.date = {};
                if (filters.startDate) {
                    where.date.gte = new Date(filters.startDate);
                }
                if (filters.endDate) {
                    where.date.lte = new Date(filters.endDate);
                }
            }
            if (filters.storeId) {
                where.storeId = filters.storeId;
            }
            if (filters.campaignId) {
                where.campaignId = filters.campaignId;
            }
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
            const averageScore = evaluations.length > 0
                ? evaluations
                    .filter(e => e.totalScore !== null && e.totalScore !== undefined)
                    .reduce((sum, e) => sum + e.totalScore, 0) / evaluations.filter(e => e.totalScore !== null).length
                : 0;
            const progressByDate = evaluations
                .filter(e => e.totalScore !== null && e.totalScore !== undefined)
                .map(e => ({
                date: e.date,
                score: e.totalScore,
                storeId: e.storeId,
                storeName: e.store.name,
            }))
                .sort((a, b) => a.date.getTime() - b.date.getTime());
            const categoriesWithScores = await this.getCategoryAveragesForSeller(sellerId, where);
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
                evaluations: evaluations.map(e => {
                    var _a;
                    return ({
                        id: e.id,
                        date: e.date,
                        score: e.totalScore,
                        store: e.store.name,
                        evaluator: `${e.evaluator.firstName} ${e.evaluator.lastName}`,
                        campaign: ((_a = e.campaign) === null || _a === void 0 ? void 0 : _a.name) || 'N/A',
                        status: e.status,
                    });
                }),
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error al obtener estadísticas del vendedor: ${error.message}`);
        }
    }
    async getStoreStats(filters) {
        try {
            const where = {};
            if (filters.startDate || filters.endDate) {
                where.date = {};
                if (filters.startDate) {
                    where.date.gte = new Date(filters.startDate);
                }
                if (filters.endDate) {
                    where.date.lte = new Date(filters.endDate);
                }
            }
            if (filters.storeId) {
                where.storeId = filters.storeId;
            }
            if (filters.campaignId) {
                where.campaignId = filters.campaignId;
            }
            if (filters.region) {
                where.store = {
                    region: filters.region,
                };
            }
            const stores = await this.prisma.store.findMany({
                where: filters.region ? { region: filters.region } : {},
                include: {
                    evaluations: {
                        where,
                    },
                },
            });
            const storeStats = stores.map(store => {
                const evaluationsCount = store.evaluations.length;
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
            storeStats.sort((a, b) => b.averageScore - a.averageScore);
            let regionAverages = [];
            if (!filters.storeId) {
                const storesByRegion = stores.reduce((acc, store) => {
                    const region = store.region || 'Sin región';
                    if (!acc[region]) {
                        acc[region] = [];
                    }
                    acc[region].push(...store.evaluations);
                    return acc;
                }, {});
                regionAverages = Object.entries(storesByRegion).map(([region, evaluations]) => {
                    const evalArray = evaluations;
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
                regionAverages.sort((a, b) => b.averageScore - a.averageScore);
            }
            return {
                storeStats,
                regionAverages: !filters.storeId ? regionAverages : [],
                totalStores: stores.length,
                totalRegions: !filters.storeId ? regionAverages.length : 0,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error al obtener estadísticas de tiendas: ${error.message}`);
        }
    }
    async getExportData(filters) {
        try {
            const where = {};
            if (filters.startDate || filters.endDate) {
                where.date = {};
                if (filters.startDate) {
                    where.date.gte = new Date(filters.startDate);
                }
                if (filters.endDate) {
                    where.date.lte = new Date(filters.endDate);
                }
            }
            if (filters.storeId) {
                where.storeId = filters.storeId;
            }
            if (filters.campaignId) {
                where.campaignId = filters.campaignId;
            }
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
            const exportData = evaluations.map(evaluation => {
                var _a;
                return ({
                    evaluationId: evaluation.id,
                    date: evaluation.date,
                    seller: `${evaluation.seller.firstName} ${evaluation.seller.lastName}`,
                    sellerEmail: evaluation.seller.email,
                    evaluator: `${evaluation.evaluator.firstName} ${evaluation.evaluator.lastName}`,
                    evaluatorEmail: evaluation.evaluator.email,
                    store: evaluation.store.name,
                    campaign: ((_a = evaluation.campaign) === null || _a === void 0 ? void 0 : _a.name) || 'N/A',
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
                });
            });
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
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error al generar datos para exportación: ${error.message}`);
        }
    }
    async getCategoryStats(filters, userRole, userId) {
        try {
            const where = {};
            if (filters.startDate || filters.endDate) {
                where.date = {};
                if (filters.startDate) {
                    where.date.gte = new Date(filters.startDate);
                }
                if (filters.endDate) {
                    where.date.lte = new Date(filters.endDate);
                }
            }
            if (filters.storeId) {
                where.storeId = filters.storeId;
            }
            if (filters.campaignId) {
                where.campaignId = filters.campaignId;
            }
            if (filters.region) {
                where.store = {
                    region: filters.region,
                };
            }
            if (userRole === 'seller') {
                where.sellerId = userId;
            }
            if (userRole === 'validator') {
                where.evaluatorId = userId;
            }
            const categoriesWithQuestions = await this.prisma.category.findMany({
                include: {
                    questions: {
                        include: {
                            answers: {
                                where: {
                                    evaluation: Object.assign({}, where),
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    order: 'asc',
                },
            });
            const categoryStats = categoriesWithQuestions.map(category => {
                const numericAnswers = category.questions.flatMap(question => question.answers
                    .filter(answer => answer.numericValue !== null && answer.numericValue !== undefined)
                    .map(answer => answer.numericValue));
                const score = numericAnswers.length > 0
                    ? parseFloat((numericAnswers.reduce((sum, score) => sum + score, 0) / numericAnswers.length).toFixed(2))
                    : 0;
                return {
                    category: category.name,
                    score
                };
            });
            categoryStats.sort((a, b) => b.score - a.score);
            return categoryStats;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error al obtener estadísticas de categorías: ${error.message}`);
        }
    }
    processScoreDistribution(scoreDistribution) {
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
        scoreDistribution.forEach(item => {
            if (item.totalScore !== null) {
                const score = item.totalScore.toString();
                if (processed[score] !== undefined) {
                    processed[score] = item._count.id;
                }
            }
        });
        return Object.entries(processed).map(([score, count]) => ({
            score: parseFloat(score),
            count: count,
        }));
    }
    async getCategoryAveragesForSeller(sellerId, additionalFilters = {}) {
        const where = Object.assign(Object.assign({}, additionalFilters), { sellerId });
        const categoriesWithQuestions = await this.prisma.category.findMany({
            include: {
                questions: {
                    include: {
                        answers: {
                            where: {
                                evaluation: Object.assign({}, where),
                            },
                        },
                    },
                },
            },
            orderBy: {
                order: 'asc',
            },
        });
        return categoriesWithQuestions.map(category => {
            const numericAnswers = category.questions.flatMap(question => question.answers
                .filter(answer => answer.numericValue !== null && answer.numericValue !== undefined)
                .map(answer => answer.numericValue));
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
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map