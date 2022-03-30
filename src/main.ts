import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { swagger } from './constants/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));
  app.enableCors();
  const options = new DocumentBuilder()
    .setTitle(swagger.title)
    .setDescription(swagger.description)
    .setVersion(swagger.version)
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 100, // limit each IP to 100 requests per windowMs
    }),
  );
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  await app.listen(port || 3000);
}
bootstrap();
