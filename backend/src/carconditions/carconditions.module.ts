import { Module } from '@nestjs/common';
import { CarConditionsService } from './carconditions.service';
import { CarConditionsController } from './carconditions.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CarConditionsController],
  providers: [CarConditionsService, PrismaService],
  exports: [CarConditionsService], // 他モジュールで使いたいときは追加
})
export class CarConditionsModule {}