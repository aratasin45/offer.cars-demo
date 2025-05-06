// src/cars/cars.module.ts
import { Module } from '@nestjs/common';
import { CarsService } from './cars.service';
import { CarsController } from './cars.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CarsService],
  controllers: [CarsController],
})
export class CarsModule {}

