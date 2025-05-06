// src/aws/s3.controller.ts
import { Controller, Delete, Get, Query } from "@nestjs/common";
import { S3Service } from "./s3.service";

@Controller("s3")
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Get("presign")
  async getPresignUrl(
    @Query("filename") filename: string,
    @Query("contentType") contentType: string
  ) {
    const url = await this.s3Service.getPresignedUrl(filename, contentType);
    return { url };
  }

  // 🔥 画像削除用のエンドポイント
  @Delete("delete")
  async deleteFile(@Query("key") key: string) {
    await this.s3Service.deleteObject(key);
    return { message: "Deleted from S3" };
  }

  
}