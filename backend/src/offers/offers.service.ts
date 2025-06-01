import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OffersService {
  
  constructor(private prisma: PrismaService) {}

  // 🔹 複数オファーの登録処理
  async createMany(
    carId: number,
    customerId: number,
    contractTerm: string,
    offers: { style: string; price: number }[],
  ) {
    const createData = offers.map((offer) => ({
      carId,
      customerId,
      style: offer.style,
      offerPrice: offer.price,
      contractTerm, // 🔹 追加
    }));

    return this.prisma.offer.createMany({
      data: createData,
    });
  }

  async findAll() {
    return this.prisma.offer.findMany({
      include: {
        car: {
          include: {
            createdByUser: true, // 🔥 登録者の情報を含める
          },
        },
        customer: true,
        
      },
    });
  }

  async findByCar(carId: number) {
    return this.prisma.offer.findMany({
      where: { carId },
      include: {
        customer: true,
      },
    });
  }

  // ✅ ステータス更新処理を追加
  async updateStatus(id: number, status: string) {
    return this.prisma.offer.update({
      where: { id },
      data: { status },
    });
  }

  
}