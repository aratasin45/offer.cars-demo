// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORSを環境変数から指定（フロントが Vercel ならそのURL）
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'https://offer-cars-demo.vercel.app',
      ];
  
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORSエラー: ${origin} は許可されていません`));
      }
    },
    credentials: true,
  });

  // Railway では process.env.PORT を使う必要あり
  await app.listen(process.env.PORT || 5001);
}
bootstrap();