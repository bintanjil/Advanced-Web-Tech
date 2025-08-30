import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService : AuthService){}
    
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
         return this.authService.signIn(loginDto.email, loginDto.password);
    }
    @Post('decodeToken')
    async decodeToken(@Body('token') token: string) {
        return this.authService.decodeToken(token);
    }
}