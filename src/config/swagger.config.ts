import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication) {
    const config = new DocumentBuilder()
        .setTitle('UTE Shop API')
        .setDescription('API for UTE Shop')
        .setVersion('1.0')
        .addTag('ute-shop')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
}
