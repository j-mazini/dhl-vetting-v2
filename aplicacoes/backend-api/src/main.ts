import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // API prefix — the frontend talks to {host}/api/v1 (see NEXT_PUBLIC_API_URL).
  app.setGlobalPrefix('api/v1');

  // Global validation pipe (Zod schemas)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Vetting 2.0 System API')
    .setDescription('Driver vetting workflow with 34 states and DHL integration')
    .setVersion('1.0.0')
    .addTag('Authentication')
    .addTag('Drivers')
    .addTag('Workflow')
    .addTag('Admin')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Start server
  const port = process.env.PORT || 3011;
  await app.listen(port, '0.0.0.0');

  logger.log(`✅ Vetting 2.0 Backend running on port ${port}`);
  logger.log(`📚 Swagger docs available at http://localhost:${port}/api/docs`);
  logger.log(`🚀 Ready to accept connections`);
}

bootstrap().catch((err) => {
  console.error('❌ Bootstrap failed:', err);
  process.exit(1);
});
