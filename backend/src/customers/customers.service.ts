import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  // 🔹 顧客を作成（パスワードをハッシュ化）
  async create(data: Prisma.CustomerCreateInput) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.customer.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  // 🔹 全顧客を取得
  async findAll() {
    return this.prisma.customer.findMany({
      orderBy: { createdAt: 'desc' }, // 任意
    });
  }

  // 🔹 ID指定で顧客を取得
  async findOne(id: number) {
    return this.prisma.customer.findUnique({
      where: { id },
    });
  }

  // 🔹 顧客を更新
  async update(id: number, data: Prisma.CustomerUpdateInput) {
    return this.prisma.customer.update({
      where: { id },
      data,
    });
  }

  // 🔹 顧客を削除
  async delete(id: number) {
    return this.prisma.customer.delete({
      where: { id },
    });
  }
}