import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { EnvVault } from './vault/env.vault';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SeedService } from './seed/seed.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableVersioning();
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      forbidUnknownValues: false,
    }),
  );
  app.enableCors({
    origin: EnvVault.CORS_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: '*',
    exposedHeaders: '*',
  });
  app.use(cookieParser());
  app.use(compression());

  const seeder = app.get(SeedService);
  await seeder.seed();
  const config = new DocumentBuilder()
    .setTitle('CS308 Parfume Backend Service')
    .setDescription('CS308 Parfume Backend API Documentation')
    .setVersion('1.0')
    .setContact(
      'Batuhan Isildak',
      'https://sabanciuniv.edu',
      'batuhamisildak@sabanciuniv.edu',
    )
    .addTag('CS308 Parfume Backend')
    .addBearerAuth(
      {
        description: 'Communication key',
        name: 'Authorization',
        bearerFormat: '',
        scheme: 'bearer',
        type: 'http',
        in: 'Header',
      },
      'authorization',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: true,
  });
  SwaggerModule.setup('docs', app, document);

  await app.listen(EnvVault.PORT, () => {
    Logger.log(
      `Server is running on http://localhost:${EnvVault.PORT}`,
      'NestApplication',
    );
  });
}
bootstrap();
