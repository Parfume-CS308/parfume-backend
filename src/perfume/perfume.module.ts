import { Module } from '@nestjs/common';
import { PerfumeController } from './perfume.controller';
import { PerfumeService } from './perfume.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Perfume, PerfumeSchema } from '../entities/perfume.entity';
import { Category, CategorySchema } from '../entities/category.entity';
import {
  Distributor,
  DistributorSchema,
} from '../entities/distributor.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Perfume.name,
        schema: PerfumeSchema,
      },
      {
        name: Category.name,
        schema: CategorySchema,
      },
      {
        name: Distributor.name,
        schema: DistributorSchema,
      },
    ]),
  ],
  controllers: [PerfumeController],
  providers: [PerfumeService],
})
export class PerfumeModule {}
