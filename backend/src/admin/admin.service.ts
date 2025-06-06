import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import * as bcrypt from 'bcrypt';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    // Check if user with this email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException(`El usuario con email ${createUserDto.email} ya existe`);
    }

    // Check if role exists
    const role = await this.prisma.role.findUnique({
      where: { id: createUserDto.roleId },
    });

    if (!role) {
      throw new NotFoundException(`El rol con id ${createUserDto.roleId} no existe`);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user
    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        roleId: createUserDto.roleId,
        storeId: createUserDto.storeId,
        active: createUserDto.active ?? true,
      },
    });
  }

  async findAllUsers(query: UserQueryDto) {
    const {
      search,
      roleId,
      active,
      createdAfter,
      createdBefore,
      sortBy,
      sortOrder,
      page = 1,
      limit = 10,
    } = query;

    // Build where conditions
    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (roleId) {
      where.roleId = roleId;
    }

    if (active !== undefined) {
      where.active = active;
    }

    if (createdAfter) {
      where.createdAt = where.createdAt || {};
      (where.createdAt as any).gte = new Date(createdAfter);
    }

    if (createdBefore) {
      where.createdAt = where.createdAt || {};
      (where.createdAt as any).lte = new Date(createdBefore);
    }

    // Build order by
    const orderBy: Prisma.UserOrderByWithRelationInput = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get users with count
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          role: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    // Remove password from response
    const sanitizedUsers = users.map(({ password, ...user }) => user);

    return {
      data: sanitizedUsers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    // Remove password from response
    const { password, ...result } = user;
    return result;
  }

  async updateUser(id: string, updateUserDto: Partial<CreateUserDto>) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    // If updating email, check if it's already taken
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new BadRequestException(`El email ${updateUserDto.email} ya está en uso`);
      }
    }

    // If updating role, check if it exists
    if (updateUserDto.roleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: updateUserDto.roleId },
      });

      if (!role) {
        throw new NotFoundException(`El rol con id ${updateUserDto.roleId} no existe`);
      }
    }

    // If updating password, hash it
    let data: any = { ...updateUserDto };
    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
    });

    // Remove password from response
    const { password, ...result } = updatedUser;
    return result;
  }

  async deleteUser(id: string) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    // Delete user
    await this.prisma.user.delete({
      where: { id },
    });

    return { message: `Usuario con id ${id} eliminado correctamente` };
  }

  async getUserStatistics() {
    // Get total users
    const totalUsers = await this.prisma.user.count();

    // Get users by role
    const usersByRole = await this.prisma.role.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    // Get active vs inactive users
    const activeUsers = await this.prisma.user.count({
      where: { active: true },
    });

    const inactiveUsers = await this.prisma.user.count({
      where: { active: false },
    });

    // Get users created per month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const usersPerMonth = await this.prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as count
      FROM "users"
      WHERE "createdAt" >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `;

    return {
      totalUsers,
      usersByRole: usersByRole.map(role => ({
        role: role.name,
        count: role._count.users,
      })),
      activeVsInactive: {
        active: activeUsers,
        inactive: inactiveUsers,
      },
      usersPerMonth,
    };
  }

  async getRoles() {
    return this.prisma.role.findMany();
  }
}
