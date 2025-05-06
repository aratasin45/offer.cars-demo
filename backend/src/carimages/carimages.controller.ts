// src/carimages/carimages.controller.ts
import {
  Controller,
  Post,
  Body,
  Delete,
  Param,
} from '@nestjs/common';
import { S3Service } from '../aws/s3.service';
import { CarImagesService } from './carimages.service';

@Controller('car-images')
export class CarImagesController {
  constructor(
    private readonly s3Service: S3Service,
    private readonly carImagesService: CarImagesService,
  ) {}

  // 修正後：フロントで送られた fileName をそのまま使う
@Post('presigned-url')
async getPresignedUrl(@Body() body: { fileName: string; contentType: string }) {
  const key = body.fileName;  // 🔥 ここ！ 'cars/' 付けない！
  const url = await this.s3Service.getPresignedUrl(key, body.contentType);
  return { url, key };
}

  // 🔹 単一画像登録
  @Post('save')
  async saveImage(@Body() body: { carId: number; imageUrl: string }) {
    const saved = await this.carImagesService.create({
      carId: body.carId,
      imageUrl: body.imageUrl,
    });
    return saved;
  }

  // 🔹 複数画像登録（今回追加）
  @Post('save-multiple')
  async saveMultipleImages(@Body() body: { carId: number; imageUrls: string[] }) {
    const result = await this.carImagesService.createMany(body.carId, body.imageUrls);
    return result;
  }

  // 👇 追加：DELETE /car-images/:id
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.carImagesService.delete(Number(id));
  }
}