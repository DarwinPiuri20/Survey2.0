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
exports.UpdateEvaluationDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_evaluation_dto_1 = require("./create-evaluation.dto");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var EvaluationStatus;
(function (EvaluationStatus) {
    EvaluationStatus["DRAFT"] = "draft";
    EvaluationStatus["COMPLETED"] = "completed";
    EvaluationStatus["FEEDBACK_GENERATED"] = "feedback_generated";
})(EvaluationStatus || (EvaluationStatus = {}));
class UpdateEvaluationDto extends (0, mapped_types_1.PartialType)(create_evaluation_dto_1.CreateEvaluationDto) {
}
exports.UpdateEvaluationDto = UpdateEvaluationDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(EvaluationStatus, { message: 'Estado debe ser uno de: draft, completed, feedback_generated' }),
    __metadata("design:type", String)
], UpdateEvaluationDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'ID de vendedor debe ser un UUID válido' }),
    __metadata("design:type", String)
], UpdateEvaluationDto.prototype, "sellerId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'ID de tienda debe ser un UUID válido' }),
    __metadata("design:type", String)
], UpdateEvaluationDto.prototype, "storeId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'ID de campaña debe ser un UUID válido' }),
    __metadata("design:type", String)
], UpdateEvaluationDto.prototype, "campaignId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_evaluation_dto_1.CreateAnswerDto),
    __metadata("design:type", Array)
], UpdateEvaluationDto.prototype, "answers", void 0);
//# sourceMappingURL=update-evaluation.dto.js.map