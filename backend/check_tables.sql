-- Script para verificar las tablas en la base de datos survey_db

-- Listar todas las tablas en el esquema público
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar si existen las tablas roles y users
SELECT 
    'Verificación de tablas' as descripcion,
    EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'roles'
    ) AS roles_exists,
    EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
    ) AS users_exists;

-- Contar registros en la tabla roles (si existe)
SELECT COUNT(*) AS roles_count 
FROM roles;

-- Contar registros en la tabla users (si existe)
SELECT COUNT(*) AS users_count 
FROM users;

-- Ver los usuarios creados (si la tabla users existe)
SELECT u.id, u.email, u."firstName", u."lastName", r.name as role
FROM users u
JOIN roles r ON u."roleId" = r.id
WHERE u.email IN ('admin@example.com', 'validator@example.com');
