import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsEmail, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsEmail({}, { message: 'Email debe tener un formato válido' })
  @IsOptional()
  email?: string;
  
  @IsString({ message: 'Password debe ser de tipo string' })
  @MinLength(8, { message: 'Password debe tener al menos 8 caracteres' })
  @IsOptional()
  password?: string;

  @IsUUID('4', { message: 'ID de rol debe ser un UUID válido' })
  @IsOptional()
  roleId?: string;

  @IsUUID('4', { message: 'ID de tienda debe ser un UUID válido' })
  @IsOptional()
  storeId?: string;

  @IsBoolean({ message: 'Active debe ser un valor booleano' })
  @IsOptional()
  active?: boolean;
}
