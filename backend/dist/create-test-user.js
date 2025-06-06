"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
async function createTestUser() {
    const prisma = new client_1.PrismaClient();
    try {
        let adminRole = await prisma.role.findFirst({
            where: { name: 'ADMIN' }
        });
        if (!adminRole) {
            adminRole = await prisma.role.create({
                data: {
                    name: 'ADMIN',
                    description: 'Administrador del sistema'
                }
            });
            console.log('Rol de administrador creado:', adminRole);
        }
        else {
            console.log('Rol de administrador ya existe:', adminRole);
        }
        const existingUser = await prisma.user.findUnique({
            where: { email: 'validator@example.com' }
        });
        if (existingUser) {
            const hashedPassword = await bcrypt.hash('Validator123!', 10);
            const updatedUser = await prisma.user.update({
                where: { email: 'validator@example.com' },
                data: {
                    password: hashedPassword,
                    active: true
                }
            });
            console.log('Contraseña de usuario actualizada:', updatedUser.email);
        }
        else {
            const hashedPassword = await bcrypt.hash('Validator123!', 10);
            const newUser = await prisma.user.create({
                data: {
                    email: 'validator@example.com',
                    password: hashedPassword,
                    firstName: 'Validator',
                    lastName: 'Test',
                    roleId: adminRole.id,
                    active: true
                }
            });
            console.log('Usuario creado:', newUser.email);
        }
    }
    catch (error) {
        console.error('Error:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
createTestUser()
    .then(() => console.log('Script completado con éxito'))
    .catch(error => console.error('Error al ejecutar el script:', error));
//# sourceMappingURL=create-test-user.js.map