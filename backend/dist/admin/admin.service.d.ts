import { PrismaService } from '../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { User } from '@prisma/client';
export declare class AdminService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createUser(createUserDto: CreateUserDto): Promise<User>;
    findAllUsers(query: UserQueryDto): Promise<{
        data: {
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
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getUserById(id: string): Promise<{
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
    }>;
    updateUser(id: string, updateUserDto: Partial<CreateUserDto>): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        roleId: string;
        storeId: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
    getUserStatistics(): Promise<{
        totalUsers: number;
        usersByRole: {
            role: string;
            count: number;
        }[];
        activeVsInactive: {
            active: number;
            inactive: number;
        };
        usersPerMonth: unknown;
    }>;
    getRoles(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
    }[]>;
}
