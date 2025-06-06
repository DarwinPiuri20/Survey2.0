import { PrismaService } from '../common/prisma/prisma.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';
export declare class EvaluationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(evaluatorId: string, createEvaluationDto: CreateEvaluationDto): Promise<{
        store: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            location: string | null;
            region: string | null;
        };
        campaign: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            active: boolean;
            description: string | null;
            startDate: Date;
            endDate: Date | null;
        };
        feedback: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            evaluationId: string;
            strengths: string;
            concerns: string;
            focusPoints: string;
            actions: string;
            rawPrompt: string | null;
            rawResponse: string | null;
        };
        evaluator: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        seller: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        answers: ({
            question: {
                category: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                    order: number;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                active: boolean;
                text: string;
                categoryId: string;
                type: string;
                options: import("@prisma/client/runtime/library").JsonValue | null;
                required: boolean;
                order: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            evaluationId: string;
            questionId: string;
            numericValue: number | null;
            textValue: string | null;
            booleanValue: boolean | null;
            optionValue: string | null;
        })[];
    } & {
        id: string;
        evaluatorId: string;
        sellerId: string;
        storeId: string;
        campaignId: string | null;
        date: Date;
        totalScore: number | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(userId: string, userRole: string, sellerId?: string, storeId?: string, campaignId?: string, status?: string, startDate?: Date, endDate?: Date, evaluatorId?: string): Promise<({
        store: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            location: string | null;
            region: string | null;
        };
        campaign: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            active: boolean;
            description: string | null;
            startDate: Date;
            endDate: Date | null;
        };
        feedback: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            evaluationId: string;
            strengths: string;
            concerns: string;
            focusPoints: string;
            actions: string;
            rawPrompt: string | null;
            rawResponse: string | null;
        };
        evaluator: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        seller: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        evaluatorId: string;
        sellerId: string;
        storeId: string;
        campaignId: string | null;
        date: Date;
        totalScore: number | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        store: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            location: string | null;
            region: string | null;
        };
        campaign: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            active: boolean;
            description: string | null;
            startDate: Date;
            endDate: Date | null;
        };
        feedback: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            evaluationId: string;
            strengths: string;
            concerns: string;
            focusPoints: string;
            actions: string;
            rawPrompt: string | null;
            rawResponse: string | null;
        };
        evaluator: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        seller: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        answers: ({
            question: {
                category: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                    order: number;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                active: boolean;
                text: string;
                categoryId: string;
                type: string;
                options: import("@prisma/client/runtime/library").JsonValue | null;
                required: boolean;
                order: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            evaluationId: string;
            questionId: string;
            numericValue: number | null;
            textValue: string | null;
            booleanValue: boolean | null;
            optionValue: string | null;
        })[];
    } & {
        id: string;
        evaluatorId: string;
        sellerId: string;
        storeId: string;
        campaignId: string | null;
        date: Date;
        totalScore: number | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, userId: string, userRole: string, updateEvaluationDto: UpdateEvaluationDto): Promise<{
        store: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            location: string | null;
            region: string | null;
        };
        campaign: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            active: boolean;
            description: string | null;
            startDate: Date;
            endDate: Date | null;
        };
        feedback: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            evaluationId: string;
            strengths: string;
            concerns: string;
            focusPoints: string;
            actions: string;
            rawPrompt: string | null;
            rawResponse: string | null;
        };
        evaluator: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        seller: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        answers: ({
            question: {
                category: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                    order: number;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                active: boolean;
                text: string;
                categoryId: string;
                type: string;
                options: import("@prisma/client/runtime/library").JsonValue | null;
                required: boolean;
                order: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            evaluationId: string;
            questionId: string;
            numericValue: number | null;
            textValue: string | null;
            booleanValue: boolean | null;
            optionValue: string | null;
        })[];
    } & {
        id: string;
        evaluatorId: string;
        sellerId: string;
        storeId: string;
        campaignId: string | null;
        date: Date;
        totalScore: number | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, userId: string, userRole: string): Promise<{
        message: string;
    }>;
    getSellerHistory(sellerId: string): Promise<{
        seller: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
        };
        stats: {
            totalEvaluations: number;
            averageScore: number;
            evaluationsByMonth: {};
            scoresByCategory: {};
        };
        evaluations: ({
            store: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                location: string | null;
                region: string | null;
            };
            campaign: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                active: boolean;
                description: string | null;
                startDate: Date;
                endDate: Date | null;
            };
            feedback: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                evaluationId: string;
                strengths: string;
                concerns: string;
                focusPoints: string;
                actions: string;
                rawPrompt: string | null;
                rawResponse: string | null;
            };
            evaluator: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            evaluatorId: string;
            sellerId: string;
            storeId: string;
            campaignId: string | null;
            date: Date;
            totalScore: number | null;
            status: string;
            createdAt: Date;
            updatedAt: Date;
        })[];
    }>;
}
