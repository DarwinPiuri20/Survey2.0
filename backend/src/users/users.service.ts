import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Crear un nuevo usuario
  async create(createUserDto: CreateUserDto) {
    // Verificar si el email ya está en uso
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Verificar si el rol existe
    const role = await this.prisma.role.findUnique({
      where: { id: createUserDto.roleId },
    });

    if (!role) {
      throw new NotFoundException(`Rol con ID ${createUserDto.roleId} no encontrado`);
    }

    // Si se especifica una tienda, verificar que exista
    if (createUserDto.storeId) {
      const store = await this.prisma.store.findUnique({
        where: { id: createUserDto.storeId },
      });

      if (!store) {
        throw new NotFoundException(`Tienda con ID ${createUserDto.storeId} no encontrada`);
      }
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Crear el usuario
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        roleId: createUserDto.roleId,
        storeId: createUserDto.storeId,
      },
      include: { role: true },
    });

    // Registrar la acción en el log de auditoría
    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE_USER',
        entityType: 'USER',
        entityId: user.id,
        details: { 
          email: user.email,
          role: user.role.name
        },
      },
    });

    // No devolver la contraseña
    const { password: _, ...result } = user;
    return result;
  }

  // Obtener todos los usuarios (con filtros opcionales)
  async findAll(roleFilter?: string, storeFilter?: string, activeOnly: boolean = true) {
    const filter: any = {};

    // Aplicar filtros si están presentes
    if (roleFilter) {
      const role = await this.prisma.role.findUnique({
        where: { name: roleFilter },
      });
      
      if (role) {
        filter.roleId = role.id;
      }
    }

    if (storeFilter) {
      filter.storeId = storeFilter;
    }

    if (activeOnly) {
      filter.active = true;
    }

    // Obtener usuarios con los filtros aplicados
    const users = await this.prisma.user.findMany({
      where: filter,
      include: {
        role: true,
      },
      orderBy: {
        firstName: 'asc',
      },
    });

    // No devolver contraseñas
    return users.map(user => {
      const { password: _, ...result } = user;
      return result;
    });
  }

  // Encontrar un usuario por ID
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { 
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // No devolver la contraseña
    const { password: _, ...result } = user;
    return result;
  }

  // Actualizar usuario
  async update(id: string, updateUserDto: UpdateUserDto) {
    // Verificar si el usuario existe
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Si se está actualizando el email, verificar que no esté en uso
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (emailExists) {
        throw new ConflictException('El email ya está en uso');
      }
    }

    // Si se está actualizando el rol, verificar que exista
    if (updateUserDto.roleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: updateUserDto.roleId },
      });

      if (!role) {
        throw new NotFoundException(`Rol con ID ${updateUserDto.roleId} no encontrado`);
      }
    }

    // Si se está actualizando la tienda, verificar que exista
    if (updateUserDto.storeId) {
      const store = await this.prisma.store.findUnique({
        where: { id: updateUserDto.storeId },
      });

      if (!store) {
        throw new NotFoundException(`Tienda con ID ${updateUserDto.storeId} no encontrada`);
      }
    }

    // Preparar datos para actualizar
    const updateData: any = { ...updateUserDto };
    
    // Hash de la contraseña si se proporciona una nueva
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Actualizar el usuario
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: { role: true },
    });

    // Registrar la acción en el log de auditoría
    await this.prisma.auditLog.create({
      data: {
        userId: id,
        action: 'UPDATE_USER',
        entityType: 'USER',
        entityId: id,
        details: { 
          updatedFields: Object.keys(updateUserDto)
        },
      },
    });

    // No devolver la contraseña
    const { password: _, ...result } = updatedUser;
    return result;
  }

  // Eliminar usuario (soft delete)
  async remove(id: string) {
    // Verificar si el usuario existe
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Desactivar el usuario en lugar de eliminarlo
    const deactivatedUser = await this.prisma.user.update({
      where: { id },
      data: { active: false },
    });

    // Registrar la acción en el log de auditoría
    await this.prisma.auditLog.create({
      data: {
        userId: id,
        action: 'DEACTIVATE_USER',
        entityType: 'USER',
        entityId: id,
        details: { 
          email: user.email
        },
      },
    });

    return { 
      message: `Usuario ${deactivatedUser.email} desactivado correctamente` 
    };
  }
}
