import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { GenerateFeedbackDto } from './dto/generate-feedback.dto';
export declare class FeedbackService {
    private prisma;
    private configService;
    private openai;
    constructor(prisma: PrismaService, configService: ConfigService);
    generateFeedback(userId: string, generateFeedbackDto: GenerateFeedbackDto): Promise<{
        evaluationId: string;
        sellerName: string;
        createdAt: Date;
        strengths: string;
        concerns: string;
        focusPoints: string;
        actions: string;
        id: string;
    }>;
    findOne(id: string): Promise<{
        evaluation: {
            evaluator: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                storeId: string | null;
                email: string;
                password: string;
                firstName: string;
                lastName: string;
                roleId: string;
                active: boolean;
            };
            seller: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                storeId: string | null;
                email: string;
                password: string;
                firstName: string;
                lastName: string;
                roleId: string;
                active: boolean;
            };
            store: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                location: string | null;
                region: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            evaluatorId: string;
            sellerId: string;
            storeId: string;
            campaignId: string | null;
            date: Date;
            totalScore: number | null;
            status: string;
        };
    } & {
        id: string;
        evaluationId: string;
        strengths: string;
        concerns: string;
        focusPoints: string;
        actions: string;
        rawPrompt: string | null;
        rawResponse: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByEvaluationId(evaluationId: string): Promise<{
        evaluation: {
            evaluator: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                storeId: string | null;
                email: string;
                password: string;
                firstName: string;
                lastName: string;
                roleId: string;
                active: boolean;
            };
            seller: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                storeId: string | null;
                email: string;
                password: string;
                firstName: string;
                lastName: string;
                roleId: string;
                active: boolean;
            };
            store: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                location: string | null;
                region: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            evaluatorId: string;
            sellerId: string;
            storeId: string;
            campaignId: string | null;
            date: Date;
            totalScore: number | null;
            status: string;
        };
    } & {
        id: string;
        evaluationId: string;
        strengths: string;
        concerns: string;
        focusPoints: string;
        actions: string;
        rawPrompt: string | null;
        rawResponse: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private buildPromptContext;
    private extractFIFASections;
}
