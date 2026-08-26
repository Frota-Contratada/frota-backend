import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';
import { Settings } from 'luxon';
import { AppModule } from './app.module';
import { ZodValidationPipe } from 'nestjs-zod';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { Server, ServerOptions } from 'socket.io';

Settings.defaultZone = process.env.TZ ?? 'UTC';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configuredOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const corsOrigin =
    configuredOrigins.length > 0
      ? configuredOrigins
      : process.env.NODE_ENV === 'production'
        ? false
        : true;

  app.enableCors({
    origin: corsOrigin,
    methods: '*',
    allowedHeaders: ['Authorization', 'Content-Type', 'Idempotency-Key', 'ngrok-skip-browser-warning'],
  });

  if (process.env.REDIS_URL) {
    const pubClient = new Redis(process.env.REDIS_URL, {
      password: process.env.REDIS_PASSWORD || undefined,
    });
    const subClient = pubClient.duplicate();
    class RedisIoAdapter extends IoAdapter {
      createIOServer(port: number, options?: ServerOptions): Server {
        const server = super.createIOServer(port, {
          ...options,
          cors: {
            origin: corsOrigin,
            methods: ['GET', 'POST'],
            allowedHeaders: ['Authorization'],
          },
        }) as Server;
        server.adapter(createAdapter(pubClient, subClient));
        return server;
      }
    }
    app.useWebSocketAdapter(new RedisIoAdapter(app));
  }

  app.useGlobalPipes(new ZodValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Backend Gestão de Frota Contratada')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Informe o access token JWT.',
      },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);

  const port = Number.parseInt(process.env.BACKEND_PORT ?? '3000', 10);
  await app.listen(port);
}
void bootstrap();
