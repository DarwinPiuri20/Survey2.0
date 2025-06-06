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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
exports.TestAuthController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const bcrypt = require("bcrypt");
const public_decorator_1 = require("./decorators/public.decorator");
let TestAuthController = class TestAuthController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async verifyCredentials(credentials) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email: credentials.email },
                include: { role: true },
            });
            if (!user) {
                return {
                    success: false,
                    message: 'Usuario no encontrado',
                    providedEmail: credentials.email
                };
            }
            const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
            if (!isPasswordValid) {
                return {
                    success: false,
                    message: 'Contraseña incorrecta',
                    providedEmail: credentials.email,
                    passwordLength: credentials.password.length
                };
            }
            if (!user.active) {
                return {
                    success: false,
                    message: 'Usuario inactivo',
                    providedEmail: credentials.email
                };
            }
            const { password: _ } = user, userInfo = __rest(user, ["password"]);
            return {
                success: true,
                message: 'Credenciales válidas',
                user: userInfo
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Error al verificar credenciales',
                error: error.message
            };
        }
    }
};
exports.TestAuthController = TestAuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('verify'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TestAuthController.prototype, "verifyCredentials", null);
exports.TestAuthController = TestAuthController = __decorate([
    (0, common_1.Controller)('test-auth'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TestAuthController);
//# sourceMappingURL=test-auth.controller.js.map