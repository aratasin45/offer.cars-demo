// src/cars/cars.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Car } from '@prisma/client';
import { MailService } from '../mailer/mailer.service';

@Injectable()
export class CarsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  // 🔹 新規登録（保存前に車両型式と車体番号を分割）
  async create(data: any): Promise<Car> {
    const { modelCodeVin, ...rest } = data;

    let modelCode = modelCodeVin;
    let vinNumber = '';

    if (modelCodeVin.includes('-') || modelCodeVin.includes('ー')) {
      const delimiter = modelCodeVin.includes('-') ? '-' : 'ー';
      const parts = modelCodeVin.split(delimiter);
      modelCode = parts[0];
      vinNumber = parts[1];
    }

    // 🔹 DBに車両を登録
    const newCar = await this.prisma.car.create({
      data: {
        ...rest,
        modelCode,
        vinNumber,
      },
    });

    // ✅ メール送信は非同期に後回し（遅延なくレスポンスを返す）
    /*setTimeout(async () => {
      const customers = await this.prisma.customer.findMany();

      await Promise.all(
        customers.map((customer) => {
          if (!customer.email) return;
          return this.mailService.sendCarRegisteredEmail(
            customer.email,
            'New Vehicle Available!',
            process.env.CUSTOMER_LOGIN_URL!,
          );
        }),
      );
    }, 0);*/

    return newCar;
  }

  // 🔹 rating を更新するメソッド
  async updateRating(carId: number, rating: number): Promise<Car> {
    return this.prisma.car.update({
      where: { id: carId },
      data: { rating },
    });
  }

  async updateCar(carId: number, data: any): Promise<Car> {
    let modelCode = data.modelCode;
    let vinNumber = data.vinNumber;
  
    if (data.modelCodeVin && typeof data.modelCodeVin === 'string') {
      if (data.modelCodeVin.includes("-") || data.modelCodeVin.includes("ー")) {
        const delimiter = data.modelCodeVin.includes("-") ? "-" : "ー";
        const parts = data.modelCodeVin.split(delimiter);
        modelCode = parts[0];
        vinNumber = parts[1];
      } else {
        modelCode = data.modelCodeVin;
        vinNumber = "";
      }
    }
  
    // ❌ 不要なフィールドを除外
    const {
      manufacturerId,
      modelCodeVin,
      id, manufacturer, createdBy, createdByUser, images, conditions,
      createdAt, updatedAt,
      ...rest
    } = data;
  
    return this.prisma.car.update({
      where: { id: carId },
      data: {
        ...rest,
        modelCode,
        vinNumber,
        ...(manufacturerId && {
          manufacturer: {
            connect: { id: manufacturerId },
          },
        }),
      },
    });
  }
  
  async updateStatus(carId: number, status: string): Promise<Car> {
    return this.prisma.car.update({
      where: { id: carId },
      data: { status },
    });
  }

  async findAvailable(): Promise<Car[]> {
    return this.prisma.car.findMany({
      where: { status: 'available' },
      include: {
        manufacturer: true,
        images: true,
        conditions: {
          include: { condition: true } // ← 🔥 condition.labelEn などを取得
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(carId: number): Promise<Car | null> {
    return this.prisma.car.findUnique({
      where: { id: carId },
      include: {
        manufacturer: true,
        images: true,
        conditions: {
          include: {
            condition: {
              select: {
                id: true,         // 🔥 ← これが無いとエラー
                labelEn: true,
              },
            },
          },
        },
      },
    });
  }

  async findAllPaginated(page: number, limit: number): Promise<{ data: Car[]; total: number }> {
    const skip = (page - 1) * limit;
  
    const [data, total] = await Promise.all([
      this.prisma.car.findMany({
        skip,
        take: limit,
        include: {
          manufacturer: true,
          createdByUser: true,
          images: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.car.count(),
    ]);
  
    return { data, total };
  }

  async findAvailablePaginated(page: number, limit: number): Promise<{ data: Car[]; total: number }> {
    const skip = (page - 1) * limit;
  
    const [data, total] = await Promise.all([
      this.prisma.car.findMany({
        skip,
        take: limit,
        where: { status: 'available' },
        include: {
          manufacturer:  {
            select: {
              nameEn: true, // ✅ 英語名のみ取得
            },
          },
          images: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.car.count({ where: { status: 'available' } }),
    ]);
  
    return { data, total };
  }
  
}