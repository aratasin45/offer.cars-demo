// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 🔹 状態マスタ登録
  await prisma.condition.createMany({
    data: [
      { label: '書類なし', labelEn: 'no document' },
      { label: '事故車', labelEn: 'accident' },
      { label: 'フレーム曲がり', labelEn: 'frame bent' },
      { label: '水没車', labelEn: 'flooded' },
      { label: '改造車', labelEn: 'modified' },
      { label: '走行距離不明', labelEn: 'unknown mileage' },
      { label: '盗難歴', labelEn: 'stolen history' },
      { label: 'エンジン不良', labelEn: 'engine issue' },
      { label: 'ミッション不良', labelEn: 'transmission issue' },
      { label: 'その他', labelEn: 'other' },
    ],
  });

  // 🔹 管理者（admin）登録
  
  await prisma.employee.create({
    data: {
      name: '佐藤 新',
      email: 'aratasato@shimashimahi.com',
      password: "$2b$10$377nrsjCZGWW1l/kjXrEkeox/yI4ANYoMzP8jPSOEjYTt15tW8M7m",
      role: 'admin',
      employeeNumber: '505',
    },
  });

  

  // 🔹 メーカー登録
  await prisma.manufacturer.createMany({
    data: [
      { name: 'トヨタ', nameEn: 'TOYOTA' },
      { name: '日産', nameEn: 'NISSAN' },
      { name: 'ホンダ', nameEn: 'HONDA' },
      { name: 'スバル', nameEn: 'SUBARU' },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());