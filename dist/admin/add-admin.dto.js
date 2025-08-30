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
exports.AddAdminDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class AddAdminDto {
    id;
    name;
    email;
    password;
    phone;
    nid;
    age;
    status;
    fileName;
}
exports.AddAdminDto = AddAdminDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1, { message: "Id must be a positive number" }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], AddAdminDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(5),
    (0, class_validator_1.Matches)(/^[A-Z][a-zA-Z\s]*$/, {
        message: 'Name should start with a capital letter and contain only alphabets'
    }),
    __metadata("design:type", String)
], AddAdminDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], AddAdminDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Password is required' }),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters long' }),
    __metadata("design:type", String)
], AddAdminDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Phone number is required' }),
    (0, class_validator_1.Matches)(/^01\d{9}$/, { message: 'Phone number must be 11 digits and start with 01' }),
    __metadata("design:type", String)
], AddAdminDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'NID number is required' }),
    (0, class_validator_1.Matches)(/^\d{10,17}$/, {
        message: 'Bangladeshi NID must be 10 to 17 digits',
    }),
    __metadata("design:type", String)
], AddAdminDto.prototype, "nid", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(18, { message: "Admin must be at least 18 years old" }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], AddAdminDto.prototype, "age", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['active', 'inactive']),
    __metadata("design:type", String)
], AddAdminDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AddAdminDto.prototype, "fileName", void 0);
//# sourceMappingURL=add-admin.dto.js.map