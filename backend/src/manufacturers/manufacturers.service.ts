// src/manufacturers/manufacturers.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ManufacturersService {
  constructor(private prisma: PrismaService) {}

  // 🔹 一覧取得
  findAll() {
    return this.prisma.manufacturer.findMany({
      orderBy: { id: 'asc' },
    });
  }

  // 🔹 新規追加
  create(data: { name: string; nameEn: string }) {
    return this.prisma.manufacturer.create({ data });
  }

  // 🔹 更新（型変換に対応）
  update(id: number, data: { name?: string; nameEn?: string }) {
    const updateData: Prisma.ManufacturerUpdateInput = {};

    if (data.name !== undefined) {
      updateData.name = { set: data.name };
    }

    if (data.nameEn !== undefined) {
      updateData.nameEn = { set: data.nameEn };
    }

    return this.prisma.manufacturer.update({
      where: { id },
      data: updateData,
    });
  }

  // 🔹 削除
  delete(id: number) {
    return this.prisma.manufacturer.delete({
      where: { id },
    });
  }
}