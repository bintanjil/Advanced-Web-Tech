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
exports.AddCustomerDto = void 0;
const class_validator_1 = require("class-validator");
class AddCustomerDto {
    username;
    fullName;
    email;
    password;
    gender;
    phone;
    dateOfBirth;
    fileName;
}
exports.AddCustomerDto = AddCustomerDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^[A-Za-z0-9_]+$/, { message: "Username must contain only letters, numbers, and underscores" }),
    __metadata("design:type", String)
], AddCustomerDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^[A-za-z\s]+$/, { message: "Full name must contain only letters and spaces" }),
    __metadata("design:type", String)
], AddCustomerDto.prototype, "fullName", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], AddCustomerDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(6),
    (0, class_validator_1.Matches)(/^(?=.*[A-Z]).*$/, { message: 'Password must contain at least one uppercase letter' }),
    __metadata("design:type", String)
], AddCustomerDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^(male|female)$/i, { message: 'Gender must be either male or female' }),
    __metadata("design:type", String)
], AddCustomerDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^01\d{9}$/, { message: 'Phone number must be 11 digits starting with 01' }),
    __metadata("design:type", String)
], AddCustomerDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, {
        message: 'Invalid date format for dateOfBirth'
    }),
    __metadata("design:type", String)
], AddCustomerDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AddCustomerDto.prototype, "fileName", void 0);
//# sourceMappingURL=add-customer.dto.js.map