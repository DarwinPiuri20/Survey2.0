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
exports.CreateUserDto = void 0;
const class_validator_1 = require("class-validator");
class CreateUserDto {
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Email debe tener un formato válido' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email es requerido' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Password debe ser de tipo string' }),
    (0, class_validator_1.MinLength)(8, { message: 'Password debe tener al menos 8 caracteres' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Password es requerido' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Nombre debe ser de tipo string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Nombre es requerido' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Apellido debe ser de tipo string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Apellido es requerido' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsUUID)('4', { message: 'ID de rol debe ser un UUID válido' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'ID de rol es requerido' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "roleId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)('4', { message: 'ID de tienda debe ser un UUID válido' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "storeId", void 0);
//# sourceMappingURL=create-user.dto.js.map