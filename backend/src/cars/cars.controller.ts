// src/cars/cars.controller.ts
import { Controller, Post, Get, Patch, Param, Body, Query } from '@nestjs/common';
import { CarsService } from './cars.service';

@Controller('cars')
export class CarsController {
  carService: any;
  constructor(private readonly carsService: CarsService) {}

  // ✅ controller 変更
@Get()
findAll(@Query('page') page = '1', @Query('limit') limit = '10') {
  return this.carsService.findAllPaginated(Number(page), Number(limit));
}

  @Post()
  create(@Body() body: any) {
    return this.carsService.create(body);
  }

  // 🔹 rating を更新する（すでにある）
  @Patch(':id/rating')
  async updateRating(@Param('id') id: string, @Body('rating') rating: number) {
    return this.carsService.updateRating(Number(id), rating);
  }

  // 🔹 車両全体の情報を更新する
  @Patch(':id')
  async updateCar(@Param('id') id: string, @Body() body: any) {
    return this.carsService.updateCar(Number(id), body);
  }

  @Patch(':id/status')
async updateStatus(@Param('id') id: string, @Body('status') status: string) {
  return this.carsService.updateStatus(Number(id), status);
}

// cars.controller.ts
@Get('available')
async getAvailableCars(@Query('page') page = '1', @Query('limit') limit = '10') {
  return this.carsService.findAvailablePaginated(Number(page), Number(limit));
}

@Get(':id')
async getCarById(@Param('id') id: string) {
  return this.carsService.findById(Number(id));
}

@Patch(':id/noget')
async markAsNoGet(@Param('id') id: string) {
  return this.carsService.updateStatus(Number(id), 'no get');
}
}