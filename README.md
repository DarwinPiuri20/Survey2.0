# Sistema de Evaluación de Vendedores

Sistema completo para evaluar el desempeño de vendedores mediante entrevistas periódicas, con generación automática de feedback personalizado utilizando inteligencia artificial.

## Tecnologías Utilizadas

### Backend
- Node.js con TypeScript
- NestJS como framework de backend
- Prisma como ORM
- PostgreSQL como base de datos
- JWT para autenticación
- OpenAI GPT-4 para generación de feedback

### Frontend (Planificado)
- React
- Material-UI para componentes visuales
- React Router para navegación
- Axios para comunicación con el backend

## Estructura del Proyecto

```
survey/
├── backend/                 # Código del servidor NestJS
│   ├── prisma/              # Esquema y migraciones de Prisma
│   ├── src/                 # Código fuente del backend
│   │   ├── auth/            # Módulo de autenticación
│   │   ├── common/          # Servicios y utilidades comunes
│   │   ├── dashboard/       # Módulo para estadísticas y visualizaciones
│   │   ├── evaluations/     # Módulo de evaluaciones
│   │   ├── feedback/        # Módulo de feedback con IA
│   │   ├── users/           # Módulo de gestión de usuarios
│   │   ├── app.module.ts    # Módulo principal de la aplicación
│   │   └── main.ts          # Punto de entrada de la aplicación
│   ├── .env                 # Variables de entorno (no incluido en repositorio)
│   ├── .env.example         # Ejemplo de variables de entorno
│   └── package.json         # Dependencias del backend
└── frontend/               # Código del cliente React (a implementar)
```

## Características Principales

- **Sistema de Autenticación**: Login y registro con JWT, control de acceso basado en roles
- **Evaluación en 3 etapas**: Observación inicial, interacción comercial, cierre y relación final
- **Feedback Automático**: Generación mediante IA en formato FIFA (Fortalezas, Inquietudes, Focos, Acciones)
- **Dashboards**: Visualización de resultados y estadísticas
- **Exportación de Datos**: Generación de reportes

## Roles de Usuario

1. **Administrador**: Acceso completo al sistema, gestión de usuarios, visualización de todas las evaluaciones
2. **Validador**: Puede realizar evaluaciones y generar feedback para los vendedores
3. **Vendedor**: Puede ver sus propias evaluaciones y feedback

## Configuración del Entorno de Desarrollo

### Requisitos Previos

- Node.js (v16+)
- PostgreSQL
- Cuenta en OpenAI (para API key)

### Pasos para Configuración del Backend

1. **Clonar el Repositorio**

```bash
git clone https://github.com/tu-usuario/survey.git
cd survey/backend
```

2. **Instalar Dependencias**

```bash
npm install
```

3. **Configurar Variables de Entorno**

Copia el archivo `.env.example` a `.env` y configura tus variables:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tu información:

```
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/db_survey?schema=public"
JWT_SECRET="tu_secreto_seguro"
JWT_EXPIRES_IN="24h"
OPENAI_API_KEY="tu_api_key_de_openai"
PORT=3000
NODE_ENV=development
```

4. **Generar Cliente Prisma**

```bash
npx prisma generate
```

5. **Ejecutar Migraciones de Base de Datos**

```bash
npx prisma migrate dev
```

6. **Iniciar el Servidor en Modo Desarrollo**

```bash
npm run start:dev
```

### Configuración Inicial (Datos Semilla)

Para configurar los datos iniciales (roles, usuarios admin, categorías y preguntas base), ejecuta:

```bash
# Este script será implementado próximamente
# npm run seed
```

## API Documentation

La documentación de la API estará disponible en `/api/docs` una vez implementada con Swagger.

## Flujo de Trabajo del Sistema

1. El administrador crea usuarios (vendedores y validadores) y configura las preguntas
2. Los validadores realizan evaluaciones a los vendedores
3. El sistema genera feedback automáticamente usando IA
4. Los vendedores pueden revisar su feedback y evaluaciones
5. Los administradores pueden ver estadísticas y generar reportes

## Próximos Pasos

- [ ] Implementar frontend en React
- [ ] Agregar tests unitarios y de integración
- [ ] Implementar CI/CD con GitHub Actions
- [ ] Documentar API con Swagger
- [ ] Implementar script de datos semilla (seed)
- [ ] Refinar algoritmo de generación de feedback
- [ ] Implementar exportación de reportes en diversos formatos
