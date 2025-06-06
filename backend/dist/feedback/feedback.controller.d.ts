import { FeedbackService } from './feedback.service';
import { GenerateFeedbackDto } from './dto/generate-feedback.dto';
export declare class FeedbackController {
    private readonly feedbackService;
    constructor(feedbackService: FeedbackService);
    generateFeedback(req: any, generateFeedbackDto: GenerateFeedbackDto): Promise<{
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
                email: string;
                password: string;
                firstName: string;
                lastName: string;
                roleId: string;
                storeId: string | null;
                active: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
            seller: {
                id: string;
                email: string;
                password: string;
                firstName: string;
                lastName: string;
                roleId: string;
                storeId: string | null;
                active: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
            store: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                location: string | null;
                region: string | null;
            };
        } & {
            id: string;
            storeId: string;
            createdAt: Date;
            updatedAt: Date;
            totalScore: number | null;
            evaluatorId: string;
            sellerId: string;
            campaignId: string | null;
            date: Date;
            status: string;
        };
    } & {
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
    }>;
    findByEvaluationId(evaluationId: string): Promise<{
        evaluation: {
            evaluator: {
                id: string;
                email: string;
                password: string;
                firstName: string;
                lastName: string;
                roleId: string;
                storeId: string | null;
                active: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
            seller: {
                id: string;
                email: string;
                password: string;
                firstName: string;
                lastName: string;
                roleId: string;
                storeId: string | null;
                active: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
            store: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                location: string | null;
                region: string | null;
            };
        } & {
            id: string;
            storeId: string;
            createdAt: Date;
            updatedAt: Date;
            totalScore: number | null;
            evaluatorId: string;
            sellerId: string;
            campaignId: string | null;
            date: Date;
            status: string;
        };
    } & {
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
    }>;
}
