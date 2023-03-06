import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: { origin: '*' },
    logger: ['error', 'warn', 'log'],
  });

  app.setGlobalPrefix('/app');

  const config = new DocumentBuilder()
    .setTitle('Chat - API')
    .setDescription('Chat - API Description')
    .setVersion('0.0.6')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
