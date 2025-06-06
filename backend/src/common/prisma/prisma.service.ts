import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  // Conectarse a la base de datos cuando se inicializa el módulo
  async onModuleInit() {
    await this.$connect();
    console.log('Conexión a base de datos establecida');
    
    // Middleware para logs (opcional)
    this.$use(async (params, next) => {
      const before = Date.now();
      const result = await next(params);
      const after = Date.now();
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Consulta ${params.model}.${params.action} tomó ${after - before}ms`);
      }
      
      return result;
    });
  }

  // Cerrar la conexión cuando el módulo se destruye
  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Conexión a base de datos cerrada');
  }
}
