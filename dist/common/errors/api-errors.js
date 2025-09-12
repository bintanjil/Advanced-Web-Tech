"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenError = exports.DuplicateError = exports.NotFoundError = exports.AuthenticationError = exports.ValidationError = exports.ApiError = void 0;
const common_1 = require("@nestjs/common");
class ApiError extends common_1.HttpException {
    constructor(message, status, errorCode) {
        super({
            statusCode: status,
            message,
            errorCode,
            timestamp: new Date().toISOString(),
        }, status);
    }
}
exports.ApiError = ApiError;
class ValidationError extends ApiError {
    constructor(message) {
        super(message, common_1.HttpStatus.BAD_REQUEST, 'VALIDATION_ERROR');
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends ApiError {
    constructor(message = 'Authentication failed') {
        super(message, common_1.HttpStatus.UNAUTHORIZED, 'AUTH_ERROR');
    }
}
exports.AuthenticationError = AuthenticationError;
class NotFoundError extends ApiError {
    constructor(resource) {
        super(`${resource} not found`, common_1.HttpStatus.NOT_FOUND, 'NOT_FOUND');
    }
}
exports.NotFoundError = NotFoundError;
class DuplicateError extends ApiError {
    constructor(resource) {
        super(`${resource} already exists`, common_1.HttpStatus.CONFLICT, 'DUPLICATE_ERROR');
    }
}
exports.DuplicateError = DuplicateError;
class ForbiddenError extends ApiError {
    constructor(message = 'Access denied') {
        super(message, common_1.HttpStatus.FORBIDDEN, 'FORBIDDEN');
    }
}
exports.ForbiddenError = ForbiddenError;
//# sourceMappingURL=api-errors.js.map