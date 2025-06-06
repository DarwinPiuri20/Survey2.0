import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Método para validar credenciales de usuario
  async validateUser(email: string, password: string): Promise<any> {
    // Buscar usuario por email
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // No devolver la contraseña en la respuesta
    const { password: _, ...result } = user;
    return result;
  }

  // Método para login
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    // Verificar si el usuario está activo
    if (!user.active) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Generar token JWT
    const payload = { 
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.name
    };

    // Auditoría desactivada - la tabla no existe en la base de datos
    // console.log('Usuario autenticado:', user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
      },
      accessToken: this.jwtService.sign(payload),
    };
  }

  // Método para registro de usuario
  async register(registerDto: RegisterDto) {
    // Verificar si el email ya está en uso
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Crear el usuario
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        roleId: registerDto.roleId,
        storeId: registerDto.storeId,
      },
      include: { role: true },
    });

    // Auditoría desactivada - la tabla no existe en la base de datos
    // console.log('Usuario registrado:', user.email);

    // No devolver la contraseña en la respuesta
    const { password: _, ...result } = user;

    return result;
  }

  // Obtener el usuario actual a partir del token
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // No devolver la contraseña en la respuesta
    const { password: _, ...result } = user;
    return result;
  }
}
