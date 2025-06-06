import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

// DTO para respuestas a preguntas
export class CreateAnswerDto {
  @IsUUID('4', { message: 'ID de pregunta debe ser un UUID válido' })
  @IsNotEmpty({ message: 'ID de pregunta es requerido' })
  questionId: string;
  
  // Las respuestas pueden ser de diferentes tipos, todos opcionales
  @IsOptional()
  numericValue?: number;
  
  @IsOptional()
  @IsString()
  textValue?: string;
  
  @IsOptional()
  booleanValue?: boolean;
  
  @IsOptional()
  @IsString()
  optionValue?: string;
}

// DTO para crear una evaluación completa
export class CreateEvaluationDto {
  @IsUUID('4', { message: 'ID de vendedor debe ser un UUID válido' })
  @IsNotEmpty({ message: 'ID de vendedor es requerido' })
  sellerId: string;

  @IsUUID('4', { message: 'ID de tienda debe ser un UUID válido' })
  @IsNotEmpty({ message: 'ID de tienda es requerido' })
  storeId: string;

  @IsUUID('4', { message: 'ID de campaña debe ser un UUID válido' })
  @IsOptional()
  campaignId?: string;
  
  // Array de respuestas a las preguntas del formulario
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerDto)
  answers: CreateAnswerDto[];
}
