import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

async function bootstrap() {
  // Carga de variables de entorno
  dotenv.config();
  
  const app = await NestFactory.create(AppModule);
  
  // Configuración global de pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // Configuración de CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // Prefijo global para la API
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 5001;
  await app.listen(port);
  console.log(`Aplicación iniciada en el puerto: ${port}`);
}
bootstrap();
