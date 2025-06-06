import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email debe tener un formato válido' })
  @IsNotEmpty({ message: 'Email es requerido' })
  email: string;

  @IsString({ message: 'Password debe ser de tipo string' })
  @IsNotEmpty({ message: 'Password es requerido' })
  password: string;
}

export class RegisterDto {
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

  @IsString({ message: 'Role ID debe ser de tipo string' })
  @IsNotEmpty({ message: 'Role ID es requerido' })
  roleId: string;

  @IsString({ message: 'Store ID debe ser de tipo string' })
  storeId?: string;
}
