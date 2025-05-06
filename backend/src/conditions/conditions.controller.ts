// src/conditions/conditions.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ConditionsService } from './conditions.service';

@Controller('conditions')
export class ConditionsController {
  constructor(private readonly service: ConditionsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() data: { label: string; labelEn: string }) {
    return this.service.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: { label?: string; labelEn?: string }) {
    return this.service.update(Number(id), data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(Number(id));
  }
}