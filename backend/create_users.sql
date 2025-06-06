-- Script para crear tablas y usuarios admin y validator en la base de datos survey_db

-- Crear tabla de roles si no existe
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de usuarios si no existe
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "roleId" UUID NOT NULL REFERENCES roles(id),
    "storeId" UUID,
    active BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar roles si no existen
INSERT INTO roles (name, description)
VALUES 
    ('admin', 'Administrador del sistema'),
    ('validator', 'Validador de evaluaciones'),
    ('seller', 'Vendedor')
ON CONFLICT (name) DO NOTHING;

-- Insertar usuarios admin y validator si no existen
DO $$
DECLARE
    admin_role_id UUID;
    validator_role_id UUID;
BEGIN
    -- Obtener IDs de roles
    SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
    SELECT id INTO validator_role_id FROM roles WHERE name = 'validator';
    
    -- Insertar usuario admin
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@example.com') THEN
        INSERT INTO users (email, password, "firstName", "lastName", "roleId")
        VALUES (
            'admin@example.com',
            -- Contraseña: Admin123! (hash bcrypt)
            '$2b$10$XdqGZBQRvQxvp.mYUKhA3.Fw2S6JWTQp1KR.Y5H9SRmjHlPtQgmHC',
            'Administrador',
            'Sistema',
            admin_role_id
        );
        RAISE NOTICE 'Usuario admin creado';
    ELSE
        RAISE NOTICE 'Usuario admin ya existe';
    END IF;
    
    -- Insertar usuario validator
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'validator@example.com') THEN
        INSERT INTO users (email, password, "firstName", "lastName", "roleId")
        VALUES (
            'validator@example.com',
            -- Contraseña: Validator123! (hash bcrypt)
            '$2b$10$XdqGZBQRvQxvp.mYUKhA3.Fw2S6JWTQp1KR.Y5H9SRmjHlPtQgmHC',
            'Validador',
            'Principal',
            validator_role_id
        );
        RAISE NOTICE 'Usuario validator creado';
    ELSE
        RAISE NOTICE 'Usuario validator ya existe';
    END IF;
END $$;

-- Verificar que los usuarios se hayan creado correctamente
SELECT u.id, u.email, u."firstName", u."lastName", r.name as role
FROM users u
JOIN roles r ON u."roleId" = r.id
WHERE u.email IN ('admin@example.com', 'validator@example.com');
