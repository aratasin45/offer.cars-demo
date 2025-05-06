// src/customers/customers.module.ts
import { Module } from '@nestjs/common';
import { CustomerService } from './customers.service';
import { CustomersController } from './customers.controller';

@Module({
  providers: [CustomerService],
  controllers: [CustomersController], // ← クラス名を修正
})
export class CustomersModule {}