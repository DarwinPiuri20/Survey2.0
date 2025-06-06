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
exports.CreateEvaluationDto = exports.CreateAnswerDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class CreateAnswerDto {
}
exports.CreateAnswerDto = CreateAnswerDto;
__decorate([
    (0, class_validator_1.IsUUID)('4', { message: 'ID de pregunta debe ser un UUID válido' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'ID de pregunta es requerido' }),
    __metadata("design:type", String)
], CreateAnswerDto.prototype, "questionId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateAnswerDto.prototype, "numericValue", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAnswerDto.prototype, "textValue", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateAnswerDto.prototype, "booleanValue", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAnswerDto.prototype, "optionValue", void 0);
class CreateEvaluationDto {
}
exports.CreateEvaluationDto = CreateEvaluationDto;
__decorate([
    (0, class_validator_1.IsUUID)('4', { message: 'ID de vendedor debe ser un UUID válido' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'ID de vendedor es requerido' }),
    __metadata("design:type", String)
], CreateEvaluationDto.prototype, "sellerId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)('4', { message: 'ID de tienda debe ser un UUID válido' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'ID de tienda es requerido' }),
    __metadata("design:type", String)
], CreateEvaluationDto.prototype, "storeId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)('4', { message: 'ID de campaña debe ser un UUID válido' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEvaluationDto.prototype, "campaignId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateAnswerDto),
    __metadata("design:type", Array)
], CreateEvaluationDto.prototype, "answers", void 0);
//# sourceMappingURL=create-evaluation.dto.js.map