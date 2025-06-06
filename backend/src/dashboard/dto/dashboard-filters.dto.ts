import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class DashboardFiltersDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsUUID('4', { message: 'ID de tienda debe ser un UUID válido' })
  storeId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'ID de campaña debe ser un UUID válido' })
  campaignId?: string;

  @IsOptional()
  @IsString()
  region?: string;
}
