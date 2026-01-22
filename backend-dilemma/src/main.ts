import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors();

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Dilemma System API')
    .setDescription('API for ethical dilemma system with decision tracking')
    .setVersion('1.0')
    .addTag('users')
    .addTag('dilemmas')
    .addTag('decisions')
    .addTag('statistics')
    .addTag('feedback')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
  console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
