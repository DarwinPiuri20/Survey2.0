import { IsNotEmpty, IsUUID } from 'class-validator';

export class GenerateFeedbackDto {
  @IsUUID('4', { message: 'ID de evaluación debe ser un UUID válido' })
  @IsNotEmpty({ message: 'ID de evaluación es requerido' })
  evaluationId: string;
}
