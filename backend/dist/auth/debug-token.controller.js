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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugTokenController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("./decorators/public.decorator");
const jwt_1 = require("@nestjs/jwt");
let DebugTokenController = class DebugTokenController {
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    debugToken(headers, req) {
        try {
            const authHeader = headers.authorization || '';
            const token = authHeader.split(' ')[1];
            if (!token) {
                return {
                    success: false,
                    message: 'No se proporcionó token',
                    headers: {
                        authorization: headers.authorization || 'No presente',
                        'content-type': headers['content-type'] || 'No presente',
                    },
                    method: req.method,
                    path: req.url,
                };
            }
            const decodedToken = this.jwtService.decode(token);
            let verifiedToken = null;
            let verificationError = null;
            try {
                verifiedToken = this.jwtService.verify(token);
            }
            catch (error) {
                verificationError = {
                    name: error.name,
                    message: error.message,
                };
            }
            return {
                success: !!verifiedToken,
                tokenProvided: !!token,
                tokenDecoded: decodedToken,
                verificationSuccess: !!verifiedToken,
                verificationError,
                headers: {
                    authorization: headers.authorization ? 'Presente (primeros 20 caracteres): ' + headers.authorization.substring(0, 20) + '...' : 'No presente',
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
    verifyTokenManually(body) {
        try {
            const { token } = body;
            if (!token) {
                return {
                    success: false,
                    message: 'No se proporcionó token en el cuerpo de la solicitud',
                };
            }
            const decodedToken = this.jwtService.decode(token);
            let verifiedToken = null;
            let verificationError = null;
            try {
                verifiedToken = this.jwtService.verify(token);
            }
            catch (error) {
                verificationError = {
                    name: error.name,
                    message: error.message,
                };
            }
            return {
                success: !!verifiedToken,
                tokenDecoded: decodedToken,
                verificationSuccess: !!verifiedToken,
                verificationError,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
};
exports.DebugTokenController = DebugTokenController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], DebugTokenController.prototype, "debugToken", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('verify'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DebugTokenController.prototype, "verifyTokenManually", null);
exports.DebugTokenController = DebugTokenController = __decorate([
    (0, common_1.Controller)('debug-token'),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], DebugTokenController);
//# sourceMappingURL=debug-token.controller.js.map