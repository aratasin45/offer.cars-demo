// src/conditions/conditions.module.ts
import { Module } from '@nestjs/common';
import { ConditionsService } from './conditions.service';
import { ConditionsController } from './conditions.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ConditionsService],
  controllers: [ConditionsController],
})
export class ConditionsModule {}