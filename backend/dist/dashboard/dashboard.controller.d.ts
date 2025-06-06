import { DashboardService } from './dashboard.service';
import { DashboardFiltersDto } from './dto/dashboard-filters.dto';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getGeneralStats(req: any, filters: DashboardFiltersDto): Promise<{
        totalEvaluations: number;
        averageScore: number;
        scoreDistribution: {
            score: number;
            count: number;
        }[];
        categoryAverages: {
            categoryId: string;
            categoryName: string;
            averageScore: number;
            totalAnswers: number;
        }[];
        monthlyTrend: unknown;
    }>;
    getSellerStats(sellerId: string, filters: DashboardFiltersDto, req: any): Promise<{
        seller: {
            id: string;
            name: string;
            email: string;
        };
        evaluationCount: number;
        averageScore: number;
        progressByDate: {
            date: Date;
            score: number;
            storeId: string;
            storeName: string;
        }[];
        categoriesWithScores: {
            categoryId: string;
            categoryName: string;
            averageScore: number;
            totalAnswers: number;
        }[];
        evaluations: {
            id: string;
            date: Date;
            score: number;
            store: string;
            evaluator: string;
            campaign: string;
            status: string;
        }[];
    }>;
    getStoreStats(filters: DashboardFiltersDto): Promise<{
        storeStats: {
            storeId: string;
            storeName: string;
            location: string;
            region: string;
            evaluationsCount: number;
            averageScore: number;
        }[];
        regionAverages: any[];
        totalStores: number;
        totalRegions: number;
    }>;
    getExportData(filters: DashboardFiltersDto): Promise<{
        metadata: {
            generatedAt: Date;
            totalEvaluations: number;
            averageScore: number;
            filters: {
                startDate: string;
                endDate: string;
                storeId: string;
                campaignId: string;
            };
        };
        data: {
            evaluationId: string;
            date: Date;
            seller: string;
            sellerEmail: string;
            evaluator: string;
            evaluatorEmail: string;
            store: string;
            campaign: string;
            totalScore: number;
            status: string;
            answers: {
                category: string;
                question: string;
                numericValue: number;
                textValue: string;
                booleanValue: boolean;
                optionValue: string;
            }[];
            feedback: {
                strengths: string;
                concerns: string;
                focusPoints: string;
                actions: string;
            };
        }[];
    }>;
    getCategoryStats(req: any, filters: DashboardFiltersDto): Promise<{
        category: string;
        score: number;
    }[]>;
}
