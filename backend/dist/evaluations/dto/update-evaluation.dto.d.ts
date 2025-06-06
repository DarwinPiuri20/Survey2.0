import { CreateEvaluationDto, CreateAnswerDto } from './create-evaluation.dto';
declare enum EvaluationStatus {
    DRAFT = "draft",
    COMPLETED = "completed",
    FEEDBACK_GENERATED = "feedback_generated"
}
declare const UpdateEvaluationDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateEvaluationDto>>;
export declare class UpdateEvaluationDto extends UpdateEvaluationDto_base {
    status?: EvaluationStatus;
    sellerId?: string;
    storeId?: string;
    campaignId?: string;
    answers?: CreateAnswerDto[];
}
export {};
