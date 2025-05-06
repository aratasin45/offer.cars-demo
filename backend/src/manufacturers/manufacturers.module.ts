// src/manufacturers/manufacturers.module.ts
import { Module } from '@nestjs/common';
import { ManufacturersService } from './manufacturers.service';
import { ManufacturersController } from './manufacturers.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ManufacturersService],
  controllers: [ManufacturersController],
})
export class ManufacturersModule {}