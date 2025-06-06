import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            role: any;
        };
        accessToken: string;
    }>;
    register(registerDto: RegisterDto): Promise<{
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
    getProfile(req: any): Promise<{
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
}
