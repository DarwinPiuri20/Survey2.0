import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email debe tener un formato válido' })
  @IsNotEmpty({ message: 'Email es requerido' })
  email: string;

  @IsString({ message: 'Password debe ser de tipo string' })
  @MinLength(8, { message: 'Password debe tener al menos 8 caracteres' })
  @IsNotEmpty({ message: 'Password es requerido' })
  password: string;

  @IsString({ message: 'Nombre debe ser de tipo string' })
  @IsNotEmpty({ message: 'Nombre es requerido' })
  firstName: string;

  @IsString({ message: 'Apellido debe ser de tipo string' })
  @IsNotEmpty({ message: 'Apellido es requerido' })
  lastName: string;

  @IsUUID('4', { message: 'ID de rol debe ser un UUID válido' })
  @IsNotEmpty({ message: 'ID de rol es requerido' })
  roleId: string;

  @IsUUID('4', { message: 'ID de tienda debe ser un UUID válido' })
  @IsOptional()
  storeId?: string;
}
