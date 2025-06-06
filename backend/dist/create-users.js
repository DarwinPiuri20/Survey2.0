"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const prisma_service_1 = require("./common/prisma/prisma.service");
const bcrypt = require("bcrypt");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const prisma = app.get(prisma_service_1.PrismaService);
    try {
        console.log('Iniciando creación de roles y usuarios...');
        let adminRole = await prisma.role.findUnique({
            where: { name: 'ADMIN' },
        });
        if (!adminRole) {
            adminRole = await prisma.role.create({
                data: {
                    name: 'ADMIN',
                    description: 'Administrador del sistema',
                },
            });
            console.log(`Rol ADMIN creado con ID: ${adminRole.id}`);
        }
        else {
            console.log(`Rol ADMIN ya existe con ID: ${adminRole.id}`);
        }
        let validatorRole = await prisma.role.findUnique({
            where: { name: 'VALIDATOR' },
        });
        if (!validatorRole) {
            validatorRole = await prisma.role.create({
                data: {
                    name: 'VALIDATOR',
                    description: 'Validador de evaluaciones',
                },
            });
            console.log(`Rol VALIDATOR creado con ID: ${validatorRole.id}`);
        }
        else {
            console.log(`Rol VALIDATOR ya existe con ID: ${validatorRole.id}`);
        }
        let sellerRole = await prisma.role.findUnique({
            where: { name: 'SELLER' },
        });
        if (!sellerRole) {
            sellerRole = await prisma.role.create({
                data: {
                    name: 'SELLER',
                    description: 'Vendedor',
                },
            });
            console.log(`Rol SELLER creado con ID: ${sellerRole.id}`);
        }
        else {
            console.log(`Rol SELLER ya existe con ID: ${sellerRole.id}`);
        }
        const firstNames = [
            'Carlos', 'Laura', 'Miguel', 'Ana', 'Javier', 'Sofía', 'David', 'María', 'José',
            'Patricia', 'Fernando', 'Gabriela', 'Roberto', 'Daniela', 'Jorge', 'Alejandra', 'Luis',
            'Valeria', 'Eduardo', 'Natalia', 'Ricardo', 'Claudia', 'Francisco', 'Silvia', 'Alberto'
        ];
        const lastNames = [
            'García', 'Rodríguez', 'López', 'Martínez', 'González', 'Pérez', 'Sánchez', 'Ramírez',
            'Torres', 'Flores', 'Rivera', 'Gómez', 'Díaz', 'Reyes', 'Cruz', 'Morales', 'Ortiz',
            'Ramos', 'Castillo', 'Romero', 'Hernández', 'Ruiz', 'Mendoza', 'Aguilar', 'Vázquez'
        ];
        const standardPassword = 'Test1234!';
        const hashedPassword = await bcrypt.hash(standardPassword, 10);
        const adminEmail = 'admin@example.com';
        const adminExists = await prisma.user.findUnique({
            where: { email: adminEmail },
        });
        if (!adminExists) {
            const admin = await prisma.user.create({
                data: {
                    email: adminEmail,
                    password: hashedPassword,
                    firstName: 'Administrador',
                    lastName: 'Sistema',
                    roleId: adminRole.id,
                    active: true,
                },
            });
            console.log(`Usuario administrador creado: ${admin.firstName} ${admin.lastName} (${admin.email})`);
        }
        else {
            console.log(`Usuario administrador ya existe: ${adminEmail}`);
        }
        const validatorEmail = 'validator@example.com';
        const validatorExists = await prisma.user.findUnique({
            where: { email: validatorEmail },
        });
        if (!validatorExists) {
            const validator = await prisma.user.create({
                data: {
                    email: validatorEmail,
                    password: hashedPassword,
                    firstName: 'Validador',
                    lastName: 'Principal',
                    roleId: validatorRole.id,
                    active: true,
                },
            });
            console.log(`Usuario validador creado: ${validator.firstName} ${validator.lastName} (${validator.email})`);
        }
        else {
            console.log(`Usuario validador ya existe: ${validatorEmail}`);
        }
        console.log('\nCreando usuarios vendedores:');
        const createdSellers = [];
        for (let i = 1; i <= 18; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const email = `${firstName.toLowerCase().charAt(0)}.${lastName.toLowerCase()}${i}@example.com`;
            const sellerExists = await prisma.user.findUnique({
                where: { email },
            });
            if (!sellerExists) {
                const seller = await prisma.user.create({
                    data: {
                        email,
                        password: hashedPassword,
                        firstName,
                        lastName,
                        roleId: sellerRole.id,
                        active: true,
                    },
                });
                createdSellers.push(seller);
                console.log(`Usuario vendedor creado: ${seller.firstName} ${seller.lastName} (${seller.email})`);
            }
            else {
                console.log(`Usuario vendedor ya existe: ${email}`);
            }
        }
        const allUsers = await prisma.user.findMany({
            include: {
                role: true,
            },
        });
        console.log('\nResumen de usuarios en el sistema:');
        console.log(`Total de usuarios: ${allUsers.length}`);
        const usersByRole = allUsers.reduce((acc, user) => {
            const roleName = user.role.name;
            acc[roleName] = (acc[roleName] || 0) + 1;
            return acc;
        }, {});
        Object.entries(usersByRole).forEach(([role, count]) => {
            console.log(`- Rol ${role}: ${count} usuarios`);
        });
        console.log('\nCredenciales de acceso para todos los usuarios:');
        console.log(`- Contraseña estándar: ${standardPassword}`);
    }
    catch (error) {
        console.error('Error al crear usuarios:', error);
    }
    finally {
        await app.close();
    }
}
bootstrap();
//# sourceMappingURL=create-users.js.map