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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createUserDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createUserDto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('El email ya está registrado');
        }
        const role = await this.prisma.role.findUnique({
            where: { id: createUserDto.roleId },
        });
        if (!role) {
            throw new common_1.NotFoundException(`Rol con ID ${createUserDto.roleId} no encontrado`);
        }
        if (createUserDto.storeId) {
            const store = await this.prisma.store.findUnique({
                where: { id: createUserDto.storeId },
            });
            if (!store) {
                throw new common_1.NotFoundException(`Tienda con ID ${createUserDto.storeId} no encontrada`);
            }
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
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
        const { password: _ } = user, result = __rest(user, ["password"]);
        return result;
    }
    async findAll(roleFilter, storeFilter, activeOnly = true) {
        const filter = {};
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
        const users = await this.prisma.user.findMany({
            where: filter,
            include: {
                role: true,
            },
            orderBy: {
                firstName: 'asc',
            },
        });
        return users.map(user => {
            const { password: _ } = user, result = __rest(user, ["password"]);
            return result;
        });
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                role: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        const { password: _ } = user, result = __rest(user, ["password"]);
        return result;
    }
    async update(id, updateUserDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!existingUser) {
            throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
            const emailExists = await this.prisma.user.findUnique({
                where: { email: updateUserDto.email },
            });
            if (emailExists) {
                throw new common_1.ConflictException('El email ya está en uso');
            }
        }
        if (updateUserDto.roleId) {
            const role = await this.prisma.role.findUnique({
                where: { id: updateUserDto.roleId },
            });
            if (!role) {
                throw new common_1.NotFoundException(`Rol con ID ${updateUserDto.roleId} no encontrado`);
            }
        }
        if (updateUserDto.storeId) {
            const store = await this.prisma.store.findUnique({
                where: { id: updateUserDto.storeId },
            });
            if (!store) {
                throw new common_1.NotFoundException(`Tienda con ID ${updateUserDto.storeId} no encontrada`);
            }
        }
        const updateData = Object.assign({}, updateUserDto);
        if (updateUserDto.password) {
            updateData.password = await bcrypt.hash(updateUserDto.password, 10);
        }
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: updateData,
            include: { role: true },
        });
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
        const { password: _ } = updatedUser, result = __rest(updatedUser, ["password"]);
        return result;
    }
    async remove(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        const deactivatedUser = await this.prisma.user.update({
            where: { id },
            data: { active: false },
        });
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map