import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';
import { Settings } from 'luxon';
import { AppModule } from './app.module';
import { ZodValidationPipe } from 'nestjs-zod';

Settings.defaultZone = process.env.TZ ?? 'UTC';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: '*',
    allowedHeaders: '*',
  });

  app.useGlobalPipes(new ZodValidationPipe())

  const config = new DocumentBuilder()
    .setTitle('Backend Gestão de Frota Contratada')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);

  const port = Number.parseInt(process.env.BACKEND_PORT ?? '3000', 10);
  await app.listen(port);
}
bootstrap();
