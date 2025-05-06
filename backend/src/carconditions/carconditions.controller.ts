// src/carconditions/carconditions.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CarConditionsService } from './carconditions.service';

@Controller('car-conditions')
export class CarConditionsController {
  constructor(private readonly carConditionsService: CarConditionsService) {}

  @Post()
  async createMany(@Body() body: { carId: number; conditionIds: number[] }) {
    const { carId, conditionIds } = body;
    return this.carConditionsService.createMany(carId, conditionIds);
  }

  // 🔹 特定の車の状態一覧を取得
  @Get(':carId')
  async getByCarId(@Param('carId') carId: string) {
    return this.carConditionsService.getByCarId(Number(carId));
  }
}