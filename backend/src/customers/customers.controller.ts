// src/customers/customers.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { CustomerService } from './customers.service';
import { Prisma } from '@prisma/client';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomerService) {}

  // 🔹 顧客を新規作成
  @Post()
  create(@Body() createCustomerDto: Prisma.CustomerCreateInput) {
    return this.customersService.create(createCustomerDto);
  }

  // 🔹 全ての顧客を取得
  @Get()
  findAll() {
    return this.customersService.findAll();
  }

  // 🔹 IDで1件取得
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(Number(id));
  }

  // 🔹 顧客を更新
  @Put(':id')
  update(@Param('id') id: string, @Body() updateCustomerDto: Prisma.CustomerUpdateInput) {
    return this.customersService.update(Number(id), updateCustomerDto);
  }

  // 🔹 顧客を削除
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.customersService.delete(Number(id));
  }
}