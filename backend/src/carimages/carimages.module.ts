// src/carimages/carimages.module.ts
import { Module } from '@nestjs/common';
import { CarImagesController } from './carimages.controller';
import { CarImagesService } from './carimages.service';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../aws/s3.service';

@Module({
  controllers: [CarImagesController],
  providers: [CarImagesService, PrismaService, S3Service],
})
export class CarImagesModule {}
