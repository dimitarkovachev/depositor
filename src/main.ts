import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';
import { ValidationPipe, BadRequestException } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
    exceptionFactory: (errors) => {
      const result = errors.map((error) => ({
        property: error.property,
        value: error.value,
        constraints: error.constraints,
      }));
      console.log('Validation errors:', JSON.stringify(result, null, 2));
      return new BadRequestException(result);
    },
  }));
  
  // Set request timeout
  app.use((req, res, next) => {
    req.setTimeout(30000); // 30 seconds
    res.setTimeout(30000);
    next();
  });

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('Depositor API')
    .setDescription('The Depositor API description')
    .setVersion('1.0')
    .addTag('health', 'Health check endpoints')
    .addTag('deposits', 'Deposit management')
    .addTag('chain-transfers', 'Chain transfer processing')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document); // Swagger UI at http://localhost:3000/swagger

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
