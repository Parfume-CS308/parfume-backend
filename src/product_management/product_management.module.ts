import { Module } from '@nestjs/common';
import { ProductManagementService } from './product_management.service';
import { ProductManagementController } from './product_management.controller';

@Module({
  providers: [ProductManagementService],
  controllers: [ProductManagementController]
})
export class ProductManagementModule {}
