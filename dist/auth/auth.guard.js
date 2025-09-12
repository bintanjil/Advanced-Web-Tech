"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const auth_constants_1 = require("./auth.constants");
const core_1 = require("@nestjs/core");
let AuthGuard = class AuthGuard {
    jwtService;
    reflector;
    constructor(jwtService, reflector) {
        this.jwtService = jwtService;
        this.reflector = reflector;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride('isPublic', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromCookies(request);
        if (!token) {
            throw new common_1.UnauthorizedException('No token provided');
        }
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: auth_constants_1.jwtConstants.secret
            });
            request.user = payload;
            const requiredRoles = this.reflector.get('roles', context.getHandler()) || [];
            if (requiredRoles.length && !requiredRoles.includes(payload.role)) {
                throw new common_1.UnauthorizedException('Insufficient permissions');
            }
            return true;
        }
        catch (error) {
            const refreshToken = this.extractRefreshTokenFromCookies(request);
            if (refreshToken) {
                try {
                    const newPayload = await this.jwtService.verifyAsync(refreshToken, {
                        secret: auth_constants_1.jwtConstants.refreshSecret
                    });
                    const newAccessToken = await this.jwtService.signAsync({
                        sub: newPayload.sub,
                        email: newPayload.email,
                        role: newPayload.role
                    }, {
                        secret: auth_constants_1.jwtConstants.secret,
                        expiresIn: '1h'
                    });
                    const response = context.switchToHttp().getResponse();
                    response.cookie('jwtToken', newAccessToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        maxAge: 3600000
                    });
                    request.user = newPayload;
                    return true;
                }
                catch (refreshError) {
                    throw new common_1.UnauthorizedException('Session expired. Please login again.');
                }
            }
            throw new common_1.UnauthorizedException(error.message || 'Invalid token');
        }
    }
    extractTokenFromCookies(request) {
        return request.cookies['jwtToken'];
    }
    extractRefreshTokenFromCookies(request) {
        return request.cookies['refreshToken'];
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        core_1.Reflector])
], AuthGuard);
//# sourceMappingURL=auth.guard.js.map