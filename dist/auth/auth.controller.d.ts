import { AuthService } from "./auth.service";
import { LoginDto } from "./login.dto";
import { Request, Response } from 'express';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, response: Response): Promise<{
        user: {
            id: any;
            email: any;
            role: string;
        };
    }>;
    logout(response: Response): Promise<{
        message: string;
    }>;
    verify(request: Request): Promise<{
        user: {
            id: any;
            email: any;
            role: any;
        };
    }>;
}
