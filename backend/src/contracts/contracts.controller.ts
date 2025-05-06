import { Body, Controller, Get, Post } from '@nestjs/common';
import { ContractsService } from './contracts.service';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  async createContract(@Body() body: {
    carId: number;
    customerId: number;
    createdById: number;
    factoryPrice: number;
    style: string;
    offerPrice: number;
    contractTerm: string;
  }) {
    return this.contractsService.create(body);
  }

  @Get()
async findAll() {
  return this.contractsService.findAll();
}
}