import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { Prisma } from '@prisma/client';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  // 🔹 全社員を取得
  @Get()
  async getAllEmployees() {
    return this.employeesService.getAllEmployees();
  }

  // 🔹 社員をIDで取得
  @Get(':id')
  async getEmployeeById(@Param('id') id: string) {
    return this.employeesService.getEmployeeById(Number(id));
  }

  // 🔹 社員を追加
  @Post()
  async createEmployee(@Body() employeeData: Prisma.EmployeeCreateInput) {
    return this.employeesService.createEmployee(employeeData);
  }

  // 🔹 社員を更新
  @Put(':id')
  async updateEmployee(@Param('id') id: string, @Body() updateData: Prisma.EmployeeUpdateInput) {
    return this.employeesService.updateEmployee(Number(id), updateData);
  }

  // 🔹 社員を削除
  @Delete(':id')
  async deleteEmployee(@Param('id') id: string) {
    return this.employeesService.deleteEmployee(Number(id));
  }
}