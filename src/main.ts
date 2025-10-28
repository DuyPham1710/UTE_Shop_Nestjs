import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { validationPipe } from './config/validation.config';
import { setupSwagger } from './config/swagger.config';
import { TransformResponseInterceptor } from './common/interceptors/response-transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global Interceptor
  app.useGlobalInterceptors(new TransformResponseInterceptor());
  // Global Validation Pipe
  app.useGlobalPipes(validationPipe);

  // Swagger
  setupSwagger(app);

  const port = process.env.PORT ?? 6969;
  await app.listen(port);
}
bootstrap();
