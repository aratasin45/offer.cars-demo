import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { EmployeesModule } from './employees/employees.module'; // 追加
import { CustomersModule } from './customers/customers.module'; 
import { ConditionsModule } from './conditions/conditions.module';
import { ManufacturersModule } from './manufacturers/manufacturers.module'; // ← 追加！
import { CarsModule } from './cars/cars.module';
import { CarConditionsModule } from './carconditions/carconditions.module';
import { S3Module } from './aws/s3.module';
import { CarImagesModule } from './carimages/carimages.module';
import { OffersModule } from './offers/offers.module';
import { ContractsModule } from './contracts/contracts.module';
import { CustomMailerModule } from './mailer/mailer.module';

@Module({
  imports: [PrismaModule, AuthModule, EmployeesModule,ConditionsModule,CustomersModule,ManufacturersModule,CarsModule,CarConditionsModule,S3Module,CarImagesModule,OffersModule,ContractsModule, CustomMailerModule,], // 追加
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}