import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtener los roles requeridos de los metadatos
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no hay roles requeridos, permitir acceso
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // Verificar que el usuario exista
    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Verificar que el usuario tenga el rol requerido
    // El rol puede venir como user.role (string) o como user.role.name
    const userRole = typeof user.role === 'string' ? user.role : user.role?.name;
    
    if (!userRole || !requiredRoles.includes(userRole)) {
      throw new ForbiddenException('No tienes permisos para acceder a este recurso');
    }

    return true;
  }
}
