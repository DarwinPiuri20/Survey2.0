import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<{
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
    findAll(role?: string, store?: string, includeInactive?: boolean): Promise<{
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
    }[]>;
    findOne(id: string): Promise<{
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
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
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
    remove(id: string): Promise<{
        message: string;
    }>;
}
