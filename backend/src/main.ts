// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORSを環境変数から指定（フロントが Vercel ならそのURL）
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Railway では process.env.PORT を使う必要あり
  await app.listen(process.env.PORT || 5001);
}
bootstrap();