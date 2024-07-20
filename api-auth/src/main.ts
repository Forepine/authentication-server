import { NestApplication, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestApplication>(AppModule);

  app.setGlobalPrefix('v1');


  const config = new DocumentBuilder()
    .setTitle('API Authentication')
    .setDescription('API authentication server for TSP clients')
    .setVersion('1.0')
    .addTag('API Module')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.APP_PORT);
}
bootstrap();
