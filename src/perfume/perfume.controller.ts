import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PerfumeService } from './perfume.service';
import { AllPerfumesResponse } from './models/all_perfumes.response';
import { Response } from 'express';
import { PerfumeDetailResponse } from './models/perfume_detail.response';
import { GetPerfumeDetailDto } from './dto/get_perfume_detail.dto';
import { PerfumeFilterDto } from './dto/get_perfumes.dto';

@Controller('perfumes')
@ApiTags('Perfumes')
export class PerfumeController {
  constructor(private readonly perfumeService: PerfumeService) {}

  @Post()
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
    @Body() filterDto: PerfumeFilterDto,
    @Res() res: Response,
  ): Promise<Response<AllPerfumesResponse>> {
    try {
      Logger.log('Fetching all perfumes', 'PerfumeController.getAllPerfumes');

      const perfumes = await this.perfumeService.getAllPerfumes(filterDto);
      Logger.log(
        `Successfully fetched all perfumes of count: ${perfumes.length}`,
        'PerfumeController.getAllPerfumes',
      );
      return res.status(200).json({
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

  @Get(':id')
  @ApiOperation({
    summary: 'Get perfume by id',
    description: 'Get a perfume by its id',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Perfume id to fetch',
  })
  @ApiOkResponse({
    description: 'Successfully fetched perfume by id',
    type: PerfumeDetailResponse,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException,
  })
  async getPerfumeById(
    @Res() res: Response,
    @Param() params: GetPerfumeDetailDto,
  ): Promise<Response<PerfumeDetailResponse>> {
    try {
      Logger.log('Fetching perfume by id', 'PerfumeController.getPerfumeById');

      const perfume = await this.perfumeService.getPerfumeById(params.id);
      Logger.log(
        `Successfully fetched perfume by id: ${perfume.id}`,
        'PerfumeController.getPerfumeById',
      );
      return res.json({
        message: 'Successfully fetched perfume by id',
        item: perfume,
      });
    } catch (error) {
      Logger.error(
        'An error occured while trying to fetch perfume by id',
        error,
        'PerfumeController.getPerfumeById',
      );
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch perfume by id');
    }
  }
}
