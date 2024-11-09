import { Module } from '@nestjs/common';
import { PerfumeController } from './perfume.controller';
import { PerfumeService } from './perfume.service';

@Module({
  controllers: [PerfumeController],
  providers: [PerfumeService],
})
export class PerfumeModule {}
