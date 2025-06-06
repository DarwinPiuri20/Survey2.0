import { AdminService } from './admin.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    createUser(createUserDto: CreateUserDto): Promise<{
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
    findAllUsers(query: UserQueryDto): Promise<{
        data: {
            role: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
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
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
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
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }[]>;
    getDashboardData(): Promise<{
        statistics: {
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
        };
        lastUpdated: Date;
    }>;
}
