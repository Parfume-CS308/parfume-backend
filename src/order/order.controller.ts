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
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/role.guard';
import { Roles } from '../decorators/role.decorator';
import { AllOrdersResponse } from './models/all_orders.resppnse';
import { Response } from 'express';
import { User } from '../decorators/user.decorator';
import { AuthTokenPayload } from '../auth/interfaces/auth-types';
import { MessageResponse } from '../common/models/message.response';
import { CreateOrderDto } from './dto/create_order.dto';
import { ObjectIdDto } from '../common/dto/object_id.dto';
import {
  CreateRefundRequestDto,
  RefundRequestIdDto,
} from './dto/refund_request.dto';
import { ProcessRefundRequestDto } from './dto/process_refund_request.dto';
import { AllRefundRequestsResponse } from './models/all_refund_requests.response';
import { UpdateOrderStatusDto } from './dto/update_order.dto';

@Controller('orders')
@ApiTags('Orders - Purchase')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Create an order',
    description: 'Create an order for the user',
  })
  @ApiOkResponse({
    description: 'Successfully created an order',
    type: MessageResponse,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException,
  })
  async createOrder(
    @Res() res: Response,
    @Body() input: CreateOrderDto,
    @User() user: AuthTokenPayload,
  ): Promise<Response<MessageResponse>> {
    try {
      Logger.log('Creating an order', 'OrderController.createOrder');
      const orderDetails = await this.orderService.createOrder(input, user.id);
      Logger.log(
        'Successfully created an order',
        'OrderController.createOrder',
      );
      return res.json({
        message: 'Successfully created an order',
        orderDetails,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      Logger.error(
        'Failed to create an order',
        error.stack,
        'OrderController.createOrder',
      );
      throw new InternalServerErrorException('Failed to create an order');
    }
  }

  @Post(':id/refundRequests')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Create a refund request for specific items in an order',
    description: 'Create a refund request for one or more items in an order',
  })
  @ApiOkResponse({
    description: 'Successfully created refund request',
    type: MessageResponse,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException,
  })
  async createRefundRequest(
    @Res() res: Response,
    @Param() paramInput: ObjectIdDto,
    @Body() input: CreateRefundRequestDto,
    @User() user: AuthTokenPayload,
  ): Promise<Response<MessageResponse>> {
    try {
      Logger.log(
        `Creating refund request for order ID: ${paramInput.id}`,
        'OrderController.createRefundRequest',
      );
      await this.orderService.createRefundRequest(
        paramInput.id,
        input,
        user.id,
      );
      return res.json({ message: 'Successfully created refund request' });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      Logger.error(
        `Failed to create refund request for order ID: ${paramInput.id}`,
        error.stack,
        'OrderController.createRefundRequest',
      );
      throw new InternalServerErrorException('Failed to create refund request');
    }
  }

  @Get('refundRequests')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get all refund requests created by the user',
    description: 'Get all refund requests created by the user',
  })
  @ApiOkResponse({
    description: 'Successfully fetched refund requests',
    type: AllRefundRequestsResponse,
  })
  async getUserRefundRequests(
    @Res() res: Response,
    @User() user: AuthTokenPayload,
  ): Promise<Response<AllRefundRequestsResponse>> {
    try {
      Logger.log(
        'Fetching user refund requests',
        'OrderController.getUserRefundRequests',
      );
      const requests = await this.orderService.getUserRefundRequests(user.id);
      return res.json({
        message: 'Successfully fetched refund requests',
        items: requests,
      });
    } catch (error) {
      Logger.error(
        'Failed to fetch user refund requests',
        error.stack,
        'OrderController.getUserRefundRequests',
      );
      if (error instanceof BadRequestException) {
        throw error;
      }
      Logger.error(
        'Failed to fetch user refund requests',
        error.stack,
        'OrderController.getUserRefundRequests',
      );
      throw new InternalServerErrorException('Failed to fetch refund requests');
    }
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get all orders of the user',
    description: 'Get all orders of the user for the user',
  })
  @ApiOkResponse({
    description: 'Successfully fetched all orders',
    type: AllOrdersResponse,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException,
  })
  async getAllOrdersOfUser(
    @Res() res: Response,
    @User() user: AuthTokenPayload,
  ): Promise<Response<AllOrdersResponse>> {
    try {
      Logger.log(
        'Fetching all orders of the user',
        'OrderController.getAllOrdersOfUser',
      );
      const orders = await this.orderService.getAllOrdersOfUser(user.id);
      Logger.log(
        `Successfully fetched all orders of the user of count: ${orders.length}`,
        'OrderController.getAllOrdersOfUser',
      );
      return res.json({
        message: 'Successfully fetched all orders',
        items: orders,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      Logger.error(
        'Failed to fetch all orders of the user',
        error.stack,
        'OrderController.getAllOrdersOfUser',
      );
      throw new InternalServerErrorException(
        'Failed to fetch all orders of the user',
      );
    }
  }

  @Get('refundRequests/all')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('product-manager', 'sales-manager')
  @ApiOperation({
    summary: 'Get all refund requests in the system',
    description: 'Get all refund requests for managers',
  })
  @ApiOkResponse({
    description: 'Successfully fetched all refund requests',
    type: AllRefundRequestsResponse,
  })
  async getAllRefundRequests(
    @Res() res: Response,
  ): Promise<Response<AllRefundRequestsResponse>> {
    try {
      Logger.log(
        'Fetching all refund requests',
        'OrderController.getAllRefundRequests',
      );
      const requests = await this.orderService.getAllRefundRequests();
      return res.json({
        message: 'Successfully fetched all refund requests',
        items: requests,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      Logger.error(
        'Failed to fetch all refund requests',
        error.stack,
        'OrderController.getAllRefundRequests',
      );
      throw new InternalServerErrorException('Failed to fetch refund requests');
    }
  }

  @Post('refundRequests/:refundRequestId/approve')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('product-manager', 'sales-manager')
  @ApiOperation({
    summary: 'Approve a refund request',
    description: 'Approve a refund request by the sales manager',
  })
  @ApiOkResponse({
    description: 'Successfully approved refund request',
    type: MessageResponse,
  })
  async approveRefundRequest(
    @Res() res: Response,
    @Param() input: RefundRequestIdDto,
  ): Promise<Response<MessageResponse>> {
    try {
      Logger.log(
        `Approving refund request ID: ${input.refundRequestId}`,
        'OrderController.approveRefundRequest',
      );
      await this.orderService.approveRefundRequest(input.refundRequestId);
      return res.json({ message: 'Successfully approved refund request' });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      Logger.error(
        `Failed to approve refund request ID: ${input.refundRequestId}`,
        error.stack,
        'OrderController.approveRefundRequest',
      );
      throw new InternalServerErrorException(
        'Failed to approve refund request',
      );
    }
  }

  @Delete('refundRequests/:refundRequestId/reject')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('product-manager', 'sales-manager')
  @ApiOperation({
    summary: 'Reject a refund request',
    description: 'Reject a refund request by the sales manager',
  })
  @ApiOkResponse({
    description: 'Successfully rejected refund request',
    type: MessageResponse,
  })
  async rejectRefundRequest(
    @Res() res: Response,
    @Param() paramInput: RefundRequestIdDto,
    @Body() input: ProcessRefundRequestDto,
  ): Promise<Response<MessageResponse>> {
    try {
      Logger.log(
        `Rejecting refund request ID: ${paramInput.refundRequestId}`,
        'OrderController.rejectRefundRequest',
      );
      await this.orderService.rejectRefundRequest(
        paramInput.refundRequestId,
        input.rejectionReason,
      );
      return res.json({ message: 'Successfully rejected refund request' });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      Logger.error(
        `Failed to reject refund request ID: ${paramInput.refundRequestId}`,
        error.stack,
        'OrderController.rejectRefundRequest',
      );
      throw new InternalServerErrorException('Failed to reject refund request');
    }
  }

  @Get('all')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('product-manager', 'sales-manager')
  @ApiOperation({
    summary: 'Get all of the orders, only for managers',
    description: 'Get all of the orders, only for managers',
  })
  @ApiOkResponse({
    description: 'Successfully fetched all orders of the system',
    type: AllOrdersResponse,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException,
  })
  async getAllOrders(
    @Res() res: Response,
  ): Promise<Response<AllOrdersResponse>> {
    try {
      Logger.log(
        `Fetching all orders of the system`,
        'OrderController.getAllOrders',
      );
      const orders = await this.orderService.getAllOrders();
      Logger.log(
        `Successfully fetched all orders of the system, count: ${orders.length}`,
        'OrderController.getAllOrders',
      );
      return res.json({
        message: 'Successfully fetched all orders',
        items: orders,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      Logger.error(
        `Failed to fetch all orders of the system`,
        error.stack,
        'OrderController.getAllOrdersOfPerfume',
      );
      throw new InternalServerErrorException(
        'Failed to fetch all orders of the system',
      );
    }
  }

  @Post('updateStatus/:orderId/:status')
  @UseGuards(AuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Update the status of an order',
    description: 'Update the status of an order',
  })
  @ApiOkResponse({
    description: 'Successfully updated the status of the order',
    type: MessageResponse,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException,
  })
  async updateOrderStatus(
    @Res() res: Response,
    @Param() paramInput: UpdateOrderStatusDto,
    @User() user: AuthTokenPayload,
  ): Promise<Response<MessageResponse>> {
    try {
      Logger.log(
        `Updating status of the order with ID: ${paramInput.orderId}`,
        'OrderController.updateOrderStatus',
      );
      await this.orderService.updateOrderStatus(
        paramInput.orderId,
        paramInput.status,
        user,
      );
      return res.json({
        message: 'Successfully updated the status of the order',
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      Logger.error(
        `Failed to update status of the order with ID: ${paramInput.orderId}`,
        error.stack,
        'OrderController.updateOrderStatus',
      );
      throw new InternalServerErrorException(
        'Failed to update status of the order',
      );
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('product-manager', 'sales-manager')
  @ApiOperation({
    summary: 'Cancel an order',
    description: 'Cancel an order by the managers',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Category id to update',
  })
  @ApiOkResponse({
    description: 'Successfully cancelled the order',
    type: MessageResponse,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException,
  })
  async cancelOrder(
    @Res() res: Response,
    @Param() paramInput: ObjectIdDto,
  ): Promise<Response<MessageResponse>> {
    try {
      Logger.log(
        `Cancelling order with ID: ${paramInput.id}`,
        'OrderController.cancelOrder',
      );
      await this.orderService.cancelOrder(paramInput.id);
      return res.json({ message: 'Successfully cancelled the order' });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      Logger.error(
        `Failed to cancel order with ID: ${paramInput.id}`,
        error.stack,
        'OrderController.cancelOrder',
      );
      throw new InternalServerErrorException('Failed to cancel the order');
    }
  }
}
