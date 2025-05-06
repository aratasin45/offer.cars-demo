import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { OffersService } from './offers.service';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  // 🔹 POST: 複数オファーを受け取る
  @Post()
  async createOffers(
    @Body()
    body: {
      carId: number;
      customerId: number;
      contractTerm: string;
      offers: { style: string; price: number }[];
    },
  ) {
    return this.offersService.createMany(body.carId, body.customerId,body.contractTerm,  body.offers,);
  }

  @Get()
  async findAll() {
    return this.offersService.findAll();
  }

  @Get('by-car')
  async findByCar(@Query('carId') carId: string) {
    return this.offersService.findByCar(Number(carId));
  }
}