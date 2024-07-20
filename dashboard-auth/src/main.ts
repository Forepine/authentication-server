import { NestApplication, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './interceptors/interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestApplication>(AppModule);

  app.enableCors();
  app.setGlobalPrefix('v1');

  const loggingInterceptor = app.get<LoggingInterceptor>(LoggingInterceptor);
  app.useGlobalInterceptors(loggingInterceptor);

  const config = new DocumentBuilder()
    .setTitle('Dashboard Authentication')
    .setDescription('Dashboard Authentication Server for TSP clients')
    .setVersion('1.0')
    .addTag('Dashboard Module')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.APP_PORT);

}
bootstrap();
