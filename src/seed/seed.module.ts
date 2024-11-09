import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service';
import { Category, CategorySchema } from '../entities/category.entity';
import { Distributor, DistributorSchema } from '../entities/distributor.entity';
import { Perfume, PerfumeSchema } from '../entities/perfume.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Distributor.name, schema: DistributorSchema },
      { name: Perfume.name, schema: PerfumeSchema },
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
