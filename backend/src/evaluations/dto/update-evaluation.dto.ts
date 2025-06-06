import { PartialType } from '@nestjs/mapped-types';
import { CreateEvaluationDto, CreateAnswerDto } from './create-evaluation.dto';
import { IsArray, IsEnum, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// Enum para los posibles estados de una evaluación
enum EvaluationStatus {
  DRAFT = 'draft',
  COMPLETED = 'completed',
  FEEDBACK_GENERATED = 'feedback_generated',
}

export class UpdateEvaluationDto extends PartialType(CreateEvaluationDto) {
  @IsOptional()
  @IsEnum(EvaluationStatus, { message: 'Estado debe ser uno de: draft, completed, feedback_generated' })
  status?: EvaluationStatus;
  
  @IsOptional()
  @IsUUID('4', { message: 'ID de vendedor debe ser un UUID válido' })
  sellerId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'ID de tienda debe ser un UUID válido' })
  storeId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'ID de campaña debe ser un UUID válido' })
  campaignId?: string;
  
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerDto)
  answers?: CreateAnswerDto[];
}
