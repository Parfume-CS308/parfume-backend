import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../decorators/role.decorator';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/role.guard';
import { CartDetailsResponse } from './models/cart_details.response';
import { Response } from 'express';
import { User } from '../decorators/user.decorator';
import { AuthTokenPayload } from '../auth/interfaces/auth-types';
import { CartService } from './cart.service';
import { SyncCartDto, SyncCartItemDto } from './dto/sync_cart.dto';

@Controller('cart')
@ApiTags('Shopping Cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('customer', 'product-manager', 'sales-manager')
  @ApiOperation({
    summary: 'Get all items in the shopping cart of the user',
    description: 'Get all items in the shopping cart of the user',
  })
  @ApiOkResponse({
    description: 'Successfully fetched all items in the shopping cart',
    type: CartDetailsResponse,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException,
  })
  async getCartDetails(
    @Res() res: Response,
    @User() user: AuthTokenPayload,
  ): Promise<Response<CartDetailsResponse>> {
    try {
      const items = await this.cartService.getCartDetails(user.id);
      return res.status(200).json({
        message: 'Successfully fetched all items in the shopping cart',
        items,
      });
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  @Post('sync')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('customer', 'product-manager', 'sales-manager')
  @ApiOperation({
    summary: 'Sync the shopping cart of the user',
    description: 'Sync the shopping cart of the user',
  })
  @ApiOkResponse({
    description: 'Successfully synced the shopping cart',
    type: CartDetailsResponse,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException,
  })
  async syncCart(
    @Res() res: Response,
    @User() user: AuthTokenPayload,
    @Body() syncCartDto: SyncCartDto,
  ): Promise<Response<CartDetailsResponse>> {
    try {
      const items = await this.cartService.syncCart(user.id, syncCartDto.items);
      return res.status(200).json({
        message: 'Successfully synced the shopping cart',
        items,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      Logger.error(
        'Failed to sync the shopping cart',
        error.stack,
        'CartController.syncCart',
      );
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  @Post('clear')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('customer', 'product-manager', 'sales-manager')
  @ApiOperation({
    summary: 'Clear the shopping cart of the user',
    description: 'Clear the shopping cart of the user',
  })
  @ApiOkResponse({
    description: 'Successfully cleared the shopping cart',
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException,
  })
  async clearCart(
    @Res() res: Response,
    @User() user: AuthTokenPayload,
  ): Promise<Response> {
    try {
      await this.cartService.clearCart(user.id);
      return res.status(200).json({
        message: 'Successfully cleared the shopping cart',
      });
    } catch (error) {
      Logger.error(
        'Failed to clear the shopping cart',
        error.stack,
        'CartController.clearCart',
      );
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  @Post('add')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('customer', 'product-manager', 'sales-manager')
  @ApiOperation({
    summary: 'Add an item to the shopping cart of the user',
    description: 'Add an item to the shopping cart of the user',
  })
  @ApiOkResponse({
    description: 'Successfully added the item to the shopping cart',
    type: CartDetailsResponse,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException,
  })
  async addItemToCart(
    @Res() res: Response,
    @User() user: AuthTokenPayload,
    @Body() syncCartDto: SyncCartDto,
  ): Promise<Response<CartDetailsResponse>> {
    try {
      const items = await this.cartService.addItemsToCart(
        user.id,
        syncCartDto.items,
      );
      return res.status(200).json({
        message: 'Successfully added the item to the shopping cart',
        items,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      Logger.error(
        'Failed to add the item to the shopping cart',
        error.stack,
        'CartController.addItemToCart',
      );
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  @Post('remove')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('customer', 'product-manager', 'sales-manager')
  @ApiOperation({
    summary: 'Remove an item from the shopping cart of the user',
    description: 'Remove an item from the shopping cart of the user',
  })
  @ApiOkResponse({
    description: 'Successfully removed the item from the shopping cart',
    type: CartDetailsResponse,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException,
  })
  async removeItemFromCart(
    @Res() res: Response,
    @User() user: AuthTokenPayload,
    @Body() removeItemDto: SyncCartItemDto,
  ): Promise<Response<CartDetailsResponse>> {
    try {
      const items = await this.cartService.removeItemFromCart(
        user.id,
        removeItemDto.perfume,
        removeItemDto.volume,
        removeItemDto.quantity,
      );
      return res.status(200).json({
        message: 'Successfully removed the item from the shopping cart',
        items,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      Logger.error(
        'Failed to remove the item from the shopping cart',
        error.stack,
        'CartController.removeItemFromCart',
      );
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
