// src/carimages/carimages.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CarImagesService {
  constructor(private prisma: PrismaService) {}

  // 単一画像登録
  async create(data: { carId: number; imageUrl: string }) {
    return this.prisma.carImage.create({ data });
  }

  // 🔹 複数画像登録（今回追加）
  async createMany(carId: number, imageUrls: string[]) {
    const data = imageUrls.map((url) => ({
      carId,
      imageUrl: url,
    }));

    return this.prisma.carImage.createMany({
      data,
    });
  }

  // 指定車両の画像一覧取得
  async getByCarId(carId: number) {
    return this.prisma.carImage.findMany({
      where: { carId },
      orderBy: { id: 'asc' },
    });
  }

  // 👇 追加
async delete(id: number) {
  return this.prisma.carImage.delete({
    where: { id },
  });
}

  
}