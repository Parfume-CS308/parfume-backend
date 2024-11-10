import {
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  Res,
} from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PerfumeService } from './perfume.service';
import { AllPerfumesResponse } from './models/all_perfumes.response';
import { Response } from 'express';

@Controller('perfumes')
@ApiTags('Perfumes')
export class PerfumeController {
  constructor(private readonly perfumeService: PerfumeService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all perfumes',
    description: 'Get all perfumes for homepage display and filtering',
  })
  @ApiOkResponse({
    description: 'Successfully fetched all perfumes',
    type: AllPerfumesResponse,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException,
  })
  async getAllPerfumes(
    @Res() res: Response,
  ): Promise<Response<AllPerfumesResponse>> {
    try {
      Logger.log('Fetching all perfumes', 'PerfumeController.getAllPerfumes');

      const perfumes = await this.perfumeService.getAllPerfumes();
      Logger.log(
        `Successfully fetched all perfumes of count: ${perfumes.length}`,
        'PerfumeController.getAllPerfumes',
      );
      return res.json({
        message: 'Successfully fetched all perfumes',
        items: perfumes,
      });
    } catch (error) {
      Logger.error(
        'An error occured while trying to fetch all perfumes',
        error,
        'PerfumeController.getAllPerfumes',
      );
      throw new InternalServerErrorException('Failed to fetch perfumes');
    }
  }
}
