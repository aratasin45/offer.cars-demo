// src/conditions/conditions.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConditionsService {
  constructor(private prisma: PrismaService) {}

  // 🔹 全ての条件を取得
  async findAll() {
    return this.prisma.condition.findMany({
      orderBy: { id: 'asc' },
    });
  }

  // 🔹 条件を1件追加
  async create(data: { label: string; labelEn: string }) {
    return this.prisma.condition.create({ data });
  }

  // 🔹 条件を更新
  async update(id: number, data: { label?: string; labelEn?: string }) {
    return this.prisma.condition.update({
      where: { id },
      data,
    });
  }

  // 🔹 条件を削除
  async delete(id: number) {
    return this.prisma.condition.delete({
      where: { id },
    });
  }
}