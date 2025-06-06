import { PrismaService } from '../common/prisma/prisma.service';
export declare class TestAuthController {
    private prisma;
    constructor(prisma: PrismaService);
    verifyCredentials(credentials: {
        email: string;
        password: string;
    }): Promise<{
        success: boolean;
        message: string;
        providedEmail: string;
        passwordLength?: undefined;
        user?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        providedEmail: string;
        passwordLength: number;
        user?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        user: {
            role: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
            };
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            roleId: string;
            storeId: string | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        providedEmail?: undefined;
        passwordLength?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        providedEmail?: undefined;
        passwordLength?: undefined;
        user?: undefined;
    }>;
}
