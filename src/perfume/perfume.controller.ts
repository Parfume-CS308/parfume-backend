import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  Patch,
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
import { CreatePerfumeDto } from './dto/create_perfume.dto';
import { DeletePerfumeDto } from './dto/delete_perfume.dto';

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
  @Post('add')
  @ApiOperation({
    summary: 'Create a new perfume',
    description:
      'Creates a new perfume entry in the database with detailed information.',
  })
  @ApiOkResponse({
    description: 'Perfume created successfully',
    schema: {
      example: {
        message: 'Perfume created successfully',
        item: {
          id: '507f1f77bcf86cd799439011',
          name: 'Midnight Rose',
          brand: 'Chanel',
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occurred',
  })
  async createPerfume(
    @Body() createPerfumeDto: CreatePerfumeDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      Logger.log('Creating a new perfume', 'PerfumeController.createPerfume');

      const newPerfume =
        await this.perfumeService.createPerfume(createPerfumeDto);
      Logger.log(
        `Perfume created with id: ${newPerfume.id}`,
        'PerfumeController.createPerfume',
      );

      return res.status(201).json({
        message: 'Perfume created successfully',
        item: newPerfume,
      });
    } catch (error) {
      Logger.error(
        'Failed to create perfume',
        error,
        'PerfumeController.createPerfume',
      );
      throw new InternalServerErrorException('Failed to create perfume');
    }
  }

  @Delete('remove/:perfumeId')
  @ApiOperation({
    summary: 'Remove a perfume',
    description:
      'Deletes a perfume entry from the database based on the provided ID.',
  })
  @ApiParam({
    name: 'perfumeId',
    type: String,
    description: 'The unique identifier of the perfume to remove.',
  })
  @ApiOkResponse({
    description: 'Perfume removed successfully',
    schema: {
      example: {
        message: 'Perfume removed successfully',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occurred',
  })
  async removePerfume(
    @Param() input: DeletePerfumeDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      Logger.log(
        `Removing perfume with id: ${input.id}`,
        'PerfumeController.removePerfume',
      );

      await this.perfumeService.removePerfume(input.id);
      Logger.log(
        `Successfully removed perfume with id: ${input.id}`,
        'PerfumeController.removePerfume',
      );

      return res.status(200).json({
        message: 'Perfume removed successfully',
      });
    } catch (error) {
      Logger.error(
        `Failed to remove perfume with id: ${input.id}`,
        error,
        'PerfumeController.removePerfume',
      );
      throw new InternalServerErrorException('Failed to remove perfume');
    }
  }

  @Patch('update/:perfumeId')
  @ApiOperation({
    summary: 'Update a perfume',
    description:
      'Updates an existing perfume entry in the database with new data.',
  })
  @ApiParam({
    name: 'perfumeId',
    type: String,
    description: 'The unique identifier of the perfume to update.',
  })
  @ApiOkResponse({
    description: 'Perfume updated successfully',
    schema: {
      example: {
        message: 'Perfume updated successfully',
        item: {
          id: '507f1f77bcf86cd799439011',
          name: 'Updated Name',
          brand: 'Updated Brand',
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error occurred',
  })
  async updatePerfume(
    @Param('perfumeId') perfumeId: string,
    @Body() updatePerfumeDto: CreatePerfumeDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      Logger.log(
        `Updating perfume with id: ${perfumeId}`,
        'PerfumeController.updatePerfume',
      );

      const updatedPerfume = await this.perfumeService.updatePerfume(
        perfumeId,
        updatePerfumeDto,
      );
      Logger.log(
        `Successfully updated perfume with id: ${perfumeId}`,
        'PerfumeController.updatePerfume',
      );

      return res.status(200).json({
        message: 'Perfume updated successfully',
        item: updatedPerfume,
      });
    } catch (error) {
      Logger.error(
        `Failed to update perfume with id: ${perfumeId}`,
        error,
        'PerfumeController.updatePerfume',
      );
      throw new InternalServerErrorException('Failed to update perfume');
    }
  }
}
