import { HttpException, HttpStatus } from '@nestjs/common';
export declare class ApiError extends HttpException {
    constructor(message: string, status: HttpStatus, errorCode?: string);
}
export declare class ValidationError extends ApiError {
    constructor(message: string);
}
export declare class AuthenticationError extends ApiError {
    constructor(message?: string);
}
export declare class NotFoundError extends ApiError {
    constructor(resource: string);
}
export declare class DuplicateError extends ApiError {
    constructor(resource: string);
}
export declare class ForbiddenError extends ApiError {
    constructor(message?: string);
}
