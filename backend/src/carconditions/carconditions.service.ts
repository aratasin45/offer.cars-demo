// src/carconditions/carconditions.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CarConditionsService {
  constructor(private prisma: PrismaService) {}

  async createMany(carId: number, conditionIds: number[]) {
    if (!Array.isArray(conditionIds)) {
      throw new Error('conditionIds must be an array');
    }

    // 既存の状態を削除
   await this.prisma.carCondition.deleteMany({
    where: { carId },
    });
  
    const data = conditionIds.map((conditionId) => ({
      carId,
      conditionId,
    }));
  
    return this.prisma.carCondition.createMany({ data });
  }

  async getByCarId(carId: number) {
    return this.prisma.carCondition.findMany({
      where: { carId },
      include: {
        condition: true, // 🔥 リレーションを取得
      },
      orderBy: { id: 'asc' },
    });
  }
}