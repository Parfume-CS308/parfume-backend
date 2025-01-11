import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  Post,
  Delete,
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
import { WishlistService } from './wishlist.service';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { RemoveFromWishlistDto } from './dto/remove-from-wishlist.dto';
import { WishlistResponse } from './models/wishlist.response';

@Controller('wishlist')
@ApiTags('Wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('customer', 'product-manager', 'sales-manager')
  @ApiOperation({
    summary: 'Get user wishlist',
    description: 'Get all items in the wishlist of the user',
  })
  @ApiOkResponse({
    description: 'Successfully fetched wishlist items',
    type: WishlistResponse,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException,
  })
  async getWishlist(
    @Res() res: Response,
    @User() user: AuthTokenPayload,
  ): Promise<Response<WishlistResponse>> {
    try {
      const response = await this.wishlistService.getWishlist(user.id);
      return res.status(200).json(response);
    } catch (error) {
      Logger.error(
        'Failed to fetch wishlist items',
        error.stack,
        'WishlistController.getWishlist',
      );
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  @Post('add')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('customer', 'product-manager', 'sales-manager')
  @ApiOperation({
    summary: 'Add perfume to wishlist',
    description: 'Add a perfume to the user wishlist',
  })
  @ApiOkResponse({
    description: 'Successfully added item to wishlist',
    type: WishlistResponse,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException,
  })
  async addToWishlist(
    @Res() res: Response,
    @User() user: AuthTokenPayload,
    @Body() dto: AddToWishlistDto,
  ): Promise<Response<WishlistResponse>> {
    try {
      const response = await this.wishlistService.addToWishlist(user.id, dto);
      return res.status(200).json(response);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      Logger.error(
        'Failed to add item to wishlist',
        error.stack,
        'WishlistController.addToWishlist',
      );
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  @Delete('remove')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('customer', 'product-manager', 'sales-manager')
  @ApiOperation({
    summary: 'Remove perfume from wishlist',
    description: 'Remove a perfume from the user wishlist',
  })
  @ApiOkResponse({
    description: 'Successfully removed item from wishlist',
    type: WishlistResponse,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException,
  })
  async removeFromWishlist(
    @Res() res: Response,
    @User() user: AuthTokenPayload,
    @Body() dto: RemoveFromWishlistDto,
  ): Promise<Response<WishlistResponse>> {
    try {
      const response = await this.wishlistService.removeFromWishlist(
        user.id,
        dto,
      );
      return res.status(200).json(response);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      Logger.error(
        'Failed to remove item from wishlist',
        error.stack,
        'WishlistController.removeFromWishlist',
      );
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  @Delete('clear')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('customer', 'product-manager', 'sales-manager')
  @ApiOperation({
    summary: 'Clear wishlist',
    description: 'Remove all items from the user wishlist',
  })
  @ApiOkResponse({
    description: 'Successfully cleared wishlist',
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException,
  })
  async clearWishlist(
    @Res() res: Response,
    @User() user: AuthTokenPayload,
  ): Promise<Response> {
    try {
      await this.wishlistService.clearWishlist(user.id);
      return res.status(200).json({
        message: 'Successfully cleared wishlist',
      });
    } catch (error) {
      Logger.error(
        'Failed to clear wishlist',
        error.stack,
        'WishlistController.clearWishlist',
      );
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
