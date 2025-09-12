import { Request, Response } from 'express';
import { AuthService } from './auth.service';
export declare class RefreshController {
    private authService;
    constructor(authService: AuthService);
    refresh(request: Request, response: Response): Promise<{
        message: string;
    }>;
}
