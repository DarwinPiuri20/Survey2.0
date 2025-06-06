"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const bcrypt = require("bcrypt");
let AdminService = class AdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createUser(createUserDto) {
        var _a;
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createUserDto.email },
        });
        if (existingUser) {
            throw new common_1.BadRequestException(`El usuario con email ${createUserDto.email} ya existe`);
        }
        const role = await this.prisma.role.findUnique({
            where: { id: createUserDto.roleId },
        });
        if (!role) {
            throw new common_1.NotFoundException(`El rol con id ${createUserDto.roleId} no existe`);
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        return this.prisma.user.create({
            data: {
                email: createUserDto.email,
                password: hashedPassword,
                firstName: createUserDto.firstName,
                lastName: createUserDto.lastName,
                roleId: createUserDto.roleId,
                storeId: createUserDto.storeId,
                active: (_a = createUserDto.active) !== null && _a !== void 0 ? _a : true,
            },
        });
    }
    async findAllUsers(query) {
        const { search, roleId, active, createdAfter, createdBefore, sortBy, sortOrder, page = 1, limit = 10, } = query;
        const where = {};
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
            where.createdAt.gte = new Date(createdAfter);
        }
        if (createdBefore) {
            where.createdAt = where.createdAt || {};
            where.createdAt.lte = new Date(createdBefore);
        }
        const orderBy = {};
        if (sortBy) {
            orderBy[sortBy] = sortOrder || 'asc';
        }
        else {
            orderBy.createdAt = 'desc';
        }
        const skip = (page - 1) * limit;
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
        const sanitizedUsers = users.map((_a) => {
            var { password } = _a, user = __rest(_a, ["password"]);
            return user;
        });
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
    async getUserById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                role: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException(`Usuario con id ${id} no encontrado`);
        }
        const { password } = user, result = __rest(user, ["password"]);
        return result;
    }
    async updateUser(id, updateUserDto) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException(`Usuario con id ${id} no encontrado`);
        }
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.prisma.user.findUnique({
                where: { email: updateUserDto.email },
            });
            if (existingUser) {
                throw new common_1.BadRequestException(`El email ${updateUserDto.email} ya está en uso`);
            }
        }
        if (updateUserDto.roleId) {
            const role = await this.prisma.role.findUnique({
                where: { id: updateUserDto.roleId },
            });
            if (!role) {
                throw new common_1.NotFoundException(`El rol con id ${updateUserDto.roleId} no existe`);
            }
        }
        let data = Object.assign({}, updateUserDto);
        if (updateUserDto.password) {
            data.password = await bcrypt.hash(updateUserDto.password, 10);
        }
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data,
        });
        const { password } = updatedUser, result = __rest(updatedUser, ["password"]);
        return result;
    }
    async deleteUser(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException(`Usuario con id ${id} no encontrado`);
        }
        await this.prisma.user.delete({
            where: { id },
        });
        return { message: `Usuario con id ${id} eliminado correctamente` };
    }
    async getUserStatistics() {
        const totalUsers = await this.prisma.user.count();
        const usersByRole = await this.prisma.role.findMany({
            include: {
                _count: {
                    select: { users: true },
                },
            },
        });
        const activeUsers = await this.prisma.user.count({
            where: { active: true },
        });
        const inactiveUsers = await this.prisma.user.count({
            where: { active: false },
        });
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const usersPerMonth = await this.prisma.$queryRaw `
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
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map