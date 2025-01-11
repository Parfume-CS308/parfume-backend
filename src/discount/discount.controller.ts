import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { Roles } from '../decorators/role.decorator';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/role.guard';
import { User } from '../decorators/user.decorator';
import { AuthTokenPayload } from '../auth/interfaces/auth-types';
import { DiscountService } from './discount.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import {
  DiscountResponse,
  AllDiscountsResponse,
} from './models/discount.response';
import { UpdateDiscountDto } from './dto/update-discount.dto';

@Controller('discounts')
@ApiTags('Discounts')
@UseGuards(AuthGuard, RolesGuard)
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Post()
  @Roles('product-manager', 'sales-manager')
  @ApiOperation({
    summary: 'Create a new discount campaign',
    description: 'Create a new discount campaign for selected perfumes',
  })
  @ApiOkResponse({
    description: 'Successfully created discount',
    type: DiscountResponse,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException,
  })
  async createDiscount(
    @Res() res: Response,
    @User() user: AuthTokenPayload,
    @Body() dto: CreateDiscountDto,
  ): Promise<Response<DiscountResponse>> {
    try {
      const response = await this.discountService.createDiscount(user.id, dto);
      return res.status(200).json(response);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      Logger.error(
        'Failed to create discount',
        error.stack,
        'DiscountController.createDiscount',
      );
      throw new InternalServerErrorException('Failed to create discount');
    }
  }

  @Get()
  @Roles('sales-manager')
  @ApiOperation({
    summary: 'Get all discounts',
    description: 'Get all discount campaigns',
  })
  @ApiOkResponse({
    description: 'Successfully fetched all discounts',
    type: AllDiscountsResponse,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException,
  })
  async getAllDiscounts(
    @Res() res: Response,
  ): Promise<Response<AllDiscountsResponse>> {
    try {
      const response = await this.discountService.getAllDiscounts();
      return res.status(200).json(response);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      Logger.error(
        'Failed to fetch discounts',
        error.stack,
        'DiscountController.getAllDiscounts',
      );
      throw new InternalServerErrorException('Failed to fetch discounts');
    }
  }

  @Put(':id')
  @Roles('sales-manager')
  @ApiOperation({
    summary: 'Update a discount campaign',
    description: 'Update an existing discount campaign',
  })
  @ApiOkResponse({
    description: 'Successfully updated discount',
    type: DiscountResponse,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException,
  })
  async updateDiscount(
    @Res() res: Response,
    @User() user: AuthTokenPayload,
    @Param('id') id: string,
    @Body() dto: UpdateDiscountDto,
  ): Promise<Response<DiscountResponse>> {
    try {
      const response = await this.discountService.updateDiscount(
        user.id,
        id,
        dto,
      );
      return res.status(200).json(response);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      Logger.error(
        'Failed to update discount',
        error.stack,
        'DiscountController.updateDiscount',
      );
      throw new InternalServerErrorException('Failed to update discount');
    }
  }

  @Delete(':id')
  @Roles('sales-manager')
  @ApiOperation({
    summary: 'Delete a discount campaign',
    description: 'Delete an existing discount campaign',
  })
  @ApiOkResponse({
    description: 'Successfully deleted discount',
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException,
  })
  async deleteDiscount(
    @Res() res: Response,
    @User() user: AuthTokenPayload,
    @Param('id') id: string,
  ): Promise<Response> {
    try {
      const response = await this.discountService.deleteDiscount(user.id, id);
      return res.status(200).json(response);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      Logger.error(
        'Failed to delete discount',
        error.stack,
        'DiscountController.deleteDiscount',
      );
      throw new InternalServerErrorException('Failed to delete discount');
    }
  }
}
