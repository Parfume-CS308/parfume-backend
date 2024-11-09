import { Test, TestingModule } from '@nestjs/testing';
import { PerfumeController } from './perfume.controller';

describe('PerfumeController', () => {
  let controller: PerfumeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PerfumeController],
    }).compile();

    controller = module.get<PerfumeController>(PerfumeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
