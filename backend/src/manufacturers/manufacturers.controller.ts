// src/manufacturers/manufacturers.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ManufacturersService } from './manufacturers.service';

@Controller('manufacturers')
export class ManufacturersController {
  constructor(private readonly manufacturersService: ManufacturersService) {}

  // 🔹 一覧取得
  @Get()
  findAll() {
    return this.manufacturersService.findAll();
  }

  // 🔹 新規追加
  @Post()
  create(@Body() body: { name: string; nameEn: string }) {
    return this.manufacturersService.create(body);
  }

  // 🔹 更新
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; nameEn?: string },
  ) {
    return this.manufacturersService.update(Number(id), body);
  }

  // 🔹 削除
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.manufacturersService.delete(Number(id));
  }
}