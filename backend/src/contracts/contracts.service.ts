import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    carId: number;
    customerId: number;
    createdById: number;
    factoryPrice: number;
    style: string;
    offerPrice: number;
    contractTerm: string;
  }) {
    const profit = data.offerPrice - data.factoryPrice;

    // 🔥 車両ステータスを sold に更新
    await this.prisma.car.update({
      where: { id: data.carId },
      data: { status: 'sold' },
    });

    // 🔥 成約情報を保存
    return this.prisma.contract.create({
      data: {
        carId: data.carId,
        customerId: data.customerId,
        createdById: data.createdById,
        factoryPrice: data.factoryPrice,
        style: data.style,
        offerPrice: data.offerPrice,
        contractTerm: data.contractTerm,
        profit,
      },
    });
  }

  async findAll() {
    return this.prisma.contract.findMany({
      include: {
        car: {
            include: {
              manufacturer: true, // ✅ これを追加
            },
          },
        customer: true,
        createdBy: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}