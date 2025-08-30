import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
    }>;
    decodeToken(token: string): Promise<any>;
}
