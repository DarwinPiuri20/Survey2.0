"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const prisma_service_1 = require("./common/prisma/prisma.service");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const prisma = app.get(prisma_service_1.PrismaService);
    try {
        console.log('Iniciando creación de categorías y preguntas...');
        const categories = [
            { name: 'Etapa 1: Observación Inicial', description: 'Preguntas relacionadas con la observación inicial del vendedor', order: 1 },
            { name: 'Etapa 2: Interacción Comercial', description: 'Preguntas relacionadas con la interacción comercial del vendedor', order: 2 },
            { name: 'Etapa 3: Cierre', description: 'Preguntas relacionadas con el cierre de la venta', order: 3 },
        ];
        for (const categoryData of categories) {
            const existingCategory = await prisma.category.findFirst({
                where: { name: categoryData.name },
            });
            if (!existingCategory) {
                const category = await prisma.category.create({
                    data: categoryData,
                });
                console.log(`Categoría creada: ${category.name} (ID: ${category.id})`);
            }
            else {
                console.log(`Categoría ya existe: ${existingCategory.name} (ID: ${existingCategory.id})`);
            }
        }
        const etapa1 = await prisma.category.findFirst({
            where: { name: 'Etapa 1: Observación Inicial' },
        });
        const etapa2 = await prisma.category.findFirst({
            where: { name: 'Etapa 2: Interacción Comercial' },
        });
        const etapa3 = await prisma.category.findFirst({
            where: { name: 'Etapa 3: Cierre' },
        });
        if (!etapa1 || !etapa2 || !etapa3) {
            throw new Error('No se pudieron encontrar todas las categorías necesarias');
        }
        const questions = [
            {
                text: '¿Observa la cantidad de inventario para generar oportunidades de venta?',
                categoryId: etapa1.id,
                type: 'numeric',
                required: true,
                order: 4,
                active: true,
            },
            {
                text: '¿Observa y levanta información de la competencia (precios/promociones)?',
                categoryId: etapa1.id,
                type: 'numeric',
                required: true,
                order: 5,
                active: true,
            },
            {
                text: '¿Observa la interacción entre dueño y panadero e identifica quién toma la decisión?',
                categoryId: etapa1.id,
                type: 'numeric',
                required: true,
                order: 6,
                active: true,
            },
            {
                text: '¿Saluda con amabilidad al dueño, dependiente y/o maestro panadero siendo empático, proactivo y proponiendo soluciones técnicas?',
                categoryId: etapa2.id,
                type: 'numeric',
                required: true,
                order: 7,
                active: true,
            },
            {
                text: '¿Informa sobre promociones y novedades (cursos especializados, productos nuevos, combos, etc.)?',
                categoryId: etapa2.id,
                type: 'numeric',
                required: true,
                order: 8,
                active: true,
            },
            {
                text: '¿Informa y presenta el catálogo y hace énfasis en características y beneficios de los productos?',
                categoryId: etapa2.id,
                type: 'numeric',
                required: true,
                order: 9,
                active: true,
            },
            {
                text: '¿Indaga más información sobre productos/rotación y sobre la competencia (precios, beneficios, etc.)?',
                categoryId: etapa2.id,
                type: 'numeric',
                required: true,
                order: 10,
                active: true,
            },
            {
                text: '¿Realiza preguntas de necesidades/disparadores y escucha con atención?',
                categoryId: etapa2.id,
                type: 'numeric',
                required: true,
                order: 11,
                active: true,
            },
            {
                text: '¿Presenta beneficios, argumentando sobre los valores agregados de la compañía?',
                categoryId: etapa2.id,
                type: 'numeric',
                required: true,
                order: 12,
                active: true,
            },
            {
                text: '¿Maneja objeciones de manera efectiva?',
                categoryId: etapa2.id,
                type: 'numeric',
                required: true,
                order: 13,
                active: true,
            },
            {
                text: '¿Cierra garantizando el pedido y fechas de entrega?',
                categoryId: etapa2.id,
                type: 'numeric',
                required: true,
                order: 14,
                active: true,
            },
            {
                text: '¿Revisa oportunidades de venta para las siguientes visitas?',
                categoryId: etapa2.id,
                type: 'numeric',
                required: true,
                order: 15,
                active: true,
            },
            {
                text: '¿Cobra las facturas pendientes y entrega el recibo de cobro o factura?',
                categoryId: etapa3.id,
                type: 'numeric',
                required: true,
                order: 16,
                active: true,
            },
            {
                text: '¿Es amable y empático al despedirse?',
                categoryId: etapa3.id,
                type: 'numeric',
                required: true,
                order: 17,
                active: true,
            },
        ];
        console.log('\nCreando preguntas:');
        for (const questionData of questions) {
            const existingQuestion = await prisma.question.findFirst({
                where: {
                    text: questionData.text,
                    categoryId: questionData.categoryId,
                },
            });
            if (!existingQuestion) {
                const question = await prisma.question.create({
                    data: questionData,
                });
                console.log(`Pregunta creada: ${question.text} (ID: ${question.id})`);
            }
            else {
                console.log(`Pregunta ya existe: ${existingQuestion.text} (ID: ${existingQuestion.id})`);
            }
        }
        const categoriesWithQuestions = await prisma.category.findMany({
            include: {
                questions: true,
            },
        });
        console.log('\nResumen de preguntas por categoría:');
        for (const category of categoriesWithQuestions) {
            console.log(`\n${category.name} (${category.questions.length} preguntas):`);
            category.questions
                .sort((a, b) => a.order - b.order)
                .forEach(question => {
                console.log(`- Pregunta ${question.order}: ${question.text}`);
            });
        }
    }
    catch (error) {
        console.error('Error al crear preguntas:', error);
    }
    finally {
        await app.close();
    }
}
bootstrap();
//# sourceMappingURL=create-questions.js.map