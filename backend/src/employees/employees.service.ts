import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  // 🔹 全社員を取得
  async getAllEmployees() {
    return this.prisma.employee.findMany({
      select: { id: true, name: true, email: true, employeeNumber: true, role: true },
    });
  }

  // 🔹 社員をIDで取得
  async getEmployeeById(id: number) {
    return this.prisma.employee.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, employeeNumber: true, role: true },
    });
  }

  // 🔹 社員を追加（パスワードをハッシュ化）
  async createEmployee(data: Prisma.EmployeeCreateInput) {
    const hashedPassword = await bcrypt.hash(data.password, 10); // 🔹 ハッシュ化

    return this.prisma.employee.create({
      data: {
        ...data,
        password: hashedPassword, // 🔹 ハッシュ化したパスワードを保存
      },
    });
  }

  // 🔹 社員を更新（パスワードを変更する場合のみハッシュ化）
  async updateEmployee(id: number, data: Prisma.EmployeeUpdateInput) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password as string, 10); // 🔹 ハッシュ化
    }

    return this.prisma.employee.update({
      where: { id },
      data,
    });
  }

  // 🔹 社員を削除
  async deleteEmployee(id: number) {
    return this.prisma.employee.delete({
      where: { id },
    });
  }
}