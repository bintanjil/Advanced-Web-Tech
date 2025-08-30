import { SellerService } from '../seller/seller.service';
import { AdminService } from 'src/admin/admin.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private adminService;
    private sellerService;
    private jwtService;
    constructor(adminService: AdminService, sellerService: SellerService, jwtService: JwtService);
    signIn(email: string, password: string): Promise<{
        access_token: string;
    }>;
    decodeToken(token: string): Promise<any>;
}
