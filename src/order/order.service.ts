import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from '../entities/order.entity';
import { Perfume } from '../entities/perfume.entity';
import { Campaign } from '../entities/campaign.entity';
import { CreateOrderDto } from './dto/create_order.dto';
import { CartService } from '../cart/cart.service';
import { OrderStatusEnum, OrderPaymentStatusEnum } from '../enums/entity.enums';
import {
  RefundRequest,
  RefundRequestStatusEnum,
} from '../entities/refund_request.entity';
import { CreateRefundRequestDto } from './dto/refund_request.dto';

@Injectable()
export class OrderService {
  private readonly statusUpdateInterval: NodeJS.Timeout;

  constructor(
    @InjectModel(Order.name)
    private readonly OrderModel: Model<Order>,

    @InjectModel(Perfume.name)
    private readonly PerfumeModel: Model<Perfume>,

    @InjectModel(RefundRequest.name)
    private readonly RefundRequestModel: Model<RefundRequest>,

    @InjectModel(Campaign.name)
    private readonly CampaignModel: Model<Campaign>,

    private readonly cartService: CartService,
  ) {}

  onModuleInit() {
    this.startStatusUpdateInterval();
  }

  onModuleDestroy() {
    if (this.statusUpdateInterval) {
      clearInterval(this.statusUpdateInterval);
    }
  }

  private startStatusUpdateInterval() {
    setInterval(async () => {
      Logger.log(
        'Interval has started to update order statuses, this is a mock implementation for demonstration purposes',
      );
      await this.updateOrderStatuses();
    }, 10000);
  }

  private async updateOrderStatuses() {
    try {
      const processingOrders = await this.OrderModel.find({
        status: OrderStatusEnum.PROCESSING,
      });
      Logger.log(`Found ${processingOrders.length} processing orders`);
      for (const order of processingOrders) {
        if (order.paymentStatus === OrderPaymentStatusEnum.PENDING) {
          const paymentSuccess = Math.random() < 0.5;

          if (paymentSuccess) {
            Logger.log(`Order ${order._id} payment will be completed`);
            await this.OrderModel.updateOne(
              { _id: order._id },
              {
                $set: {
                  paymentStatus: OrderPaymentStatusEnum.COMPLETED,
                  status: OrderStatusEnum.IN_TRANSIT,
                },
              },
            );
            Logger.log(
              `Order ${order._id} payment completed and status updated to IN_TRANSIT`,
            );
          } else {
            Logger.log(
              `Order ${order._id} payment will fail and order status will be updated to CANCELLED`,
            );
            await this.OrderModel.updateOne(
              { _id: order._id },
              {
                $set: {
                  paymentStatus: OrderPaymentStatusEnum.FAILED,
                  status: OrderStatusEnum.CANCELED,
                },
              },
            );
            Logger.log(
              `Order ${order._id} payment failed and order status updated to CANCELLED`,
            );
          }
          continue;
        }
      }

      const inTransitOrders = await this.OrderModel.find({
        status: OrderStatusEnum.IN_TRANSIT,
      });
      Logger.log(`Found ${inTransitOrders.length} in-transit orders`);
      for (const order of inTransitOrders) {
        // Mock delivery completion (50% chance)
        if (Math.random() < 0.5) {
          Logger.log(`Order ${order._id} will be delivered`);
          await this.OrderModel.updateOne(
            { _id: order._id },
            { $set: { status: OrderStatusEnum.DELIVERED } },
          );
          Logger.log(`Order ${order._id} delivered successfully`);
        } else {
          Logger.log(`Order ${order._id} delivery will be delayed`);
        }
      }
    } catch (error) {
      Logger.error('Failed to update order statuses', error.stack);
    }
  }

  private async validateAndCalculateOrder(
    items: Array<{
      perfumeId: string;
      volume: number;
      quantity: number;
    }>,
    campaignIds?: string[],
  ): Promise<{
    perfumes: Array<{
      perfume: Perfume;
      volume: number;
      quantity: number;
      price: number;
      totalPrice: number;
    }>;
    campaigns?: Campaign[];
    totalAmount: number;
    campaignDiscountAmount: number;
  }> {
    const perfumes = [];
    let totalAmount = 0;

    for (const item of items) {
      const perfume = await this.PerfumeModel.findById(item.perfumeId);
      if (!perfume) {
        throw new BadRequestException(`Perfume not found: ${item.perfumeId}`);
      }

      const variant = perfume.variants.find(
        (v) => v.volume === item.volume && v.active && v.stock >= item.quantity,
      );

      if (!variant) {
        throw new BadRequestException(
          `Invalid volume or insufficient stock for perfume: ${perfume.name}`,
        );
      }

      const itemTotalPrice = variant.price * item.quantity;
      totalAmount += itemTotalPrice;

      perfumes.push({
        perfume,
        volume: item.volume,
        quantity: item.quantity,
        price: variant.price,
        totalPrice: itemTotalPrice,
      });
    }

    let campaignDiscountAmount = 0;
    let appliedCampaigns: Campaign[] = [];

    if (campaignIds && campaignIds.length > 0) {
      const campaigns = await this.CampaignModel.find({
        _id: { $in: campaignIds },
        active: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      });

      if (campaigns.length !== campaignIds.length) {
        throw new BadRequestException(
          'One or more campaigns are invalid or expired',
        );
      }

      // Apply campaign discounts
      for (const campaign of campaigns) {
        const discountAmount = (totalAmount * campaign.discountRate) / 100;
        campaignDiscountAmount += discountAmount;
        appliedCampaigns.push(campaign);
      }
    }

    return {
      perfumes,
      campaigns: appliedCampaigns,
      totalAmount,
      campaignDiscountAmount,
    };
  }

  async createOrder(input: CreateOrderDto, userId: string): Promise<void> {
    const userCart = await this.cartService.getCartDetails(userId);
    const orderItems = userCart.items;

    if (!orderItems || orderItems.length === 0) {
      throw new BadRequestException('No items to order, the shopping cart is empty');
    }

    const { perfumes, campaigns, totalAmount, campaignDiscountAmount } =
      await this.validateAndCalculateOrder(orderItems, input.campaignIds);

    const order = new this.OrderModel({
      user: new Types.ObjectId(userId),
      items: perfumes.map((p) => ({
        perfume: p.perfume._id,
        volume: p.volume,
        quantity: p.quantity,
        price: p.price,
        totalPrice: p.totalPrice,
      })),
      totalAmount,
      appliedCampaigns: campaigns?.map((c) => c._id) || [],
      campaignDiscountAmount,
      status: OrderStatusEnum.PROCESSING,
      paymentStatus: OrderPaymentStatusEnum.PENDING,
      shippingAddress: input.shippingAddress,
      paymentId: input.paymentId,
      taxId: input.taxId || null,
      invoiceNumber: Math.floor(Math.random() * 1000000000).toString(),
      invoiceUrl: 'https://example.com/invoice.pdf',
    });
    try {
      await order.save();

      for (const item of perfumes) {
        await this.PerfumeModel.updateOne(
          {
            _id: item.perfume._id,
            'variants.volume': item.volume,
          },
          {
            $inc: { 'variants.$.stock': -item.quantity },
          },
        );
      }
      await this.cartService.clearCart(userId);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      Logger.error(error, 'Order creation failed');
      throw error;
    }
  }

  async getAllOrdersOfPerfume(perfumeId: string): Promise<Array<any>> {

    const perfume = await this.PerfumeModel.findById(perfumeId);
    if (!perfume) {
      throw new BadRequestException('Perfume not found, cannot retrieve orders');
    }
    const orders = await this.OrderModel.find({
      'items.perfume': new Types.ObjectId(perfumeId),
    })
      .populate('user', 'email firstName lastName')
      .populate({
        path: 'items.perfume',
        model: Perfume.name,
        select: 'name brand',
      })
      .populate('appliedCampaigns', 'name discountRate')
      .sort({ createdAt: -1 });

    return orders.map((order) => ({
      orderId: order._id.toString(),
      userId: order.user._id.toString(),
      userEmail: order.user.email,
      userName: `${order.user.firstName} ${order.user.lastName}`,
      items: order.items.map((item) => ({
        perfumeId: item.perfume._id.toString(),
        perfumeName: (item.perfume as any as Perfume).name,
        brand: (item.perfume as any as Perfume).brand,
        volume: item.volume,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: order.totalAmount,
      appliedCampaigns: order.appliedCampaigns.map((campaign) => ({
        campaignId: campaign._id.toString(),
        name: campaign.name,
        discountRate: campaign.discountRate,
      })),
      campaignDiscountAmount: order.campaignDiscountAmount,
      status: order.status,
      shippingAddress: order.shippingAddress,
      paymentStatus: order.paymentStatus,
      paymentId: order.paymentId,
      invoiceNumber: order.invoiceNumber,
      invoiceUrl: order.invoiceUrl,
      createdAt: order.createdAt.getTime(),
    }));
  }

  async getAllOrdersOfUser(userId: string): Promise<Array<any>> {
    const orders = await this.OrderModel.find({
      user: new Types.ObjectId(userId),
    })
      .populate({
        path: 'items.perfume',
        model: Perfume.name,
        select: 'name brand',
      })
      .populate('appliedCampaigns', 'name discountRate')
      .sort({ createdAt: -1 });

    return orders.map((order) => ({
      orderId: order._id.toString(),
      items: order.items.map((item) => ({
        perfumeId: item.perfume._id.toString(),
        perfumeName: (item.perfume as any as Perfume).name,
        brand: (item.perfume as any as Perfume).brand,
        volume: item.volume,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: order.totalAmount,
      appliedCampaigns: order.appliedCampaigns.map((campaign) => ({
        campaignId: campaign._id.toString(),
        name: campaign.name,
        discountRate: campaign.discountRate,
      })),
      campaignDiscountAmount: order.campaignDiscountAmount,
      status: order.status,
      shippingAddress: order.shippingAddress,
      paymentStatus: order.paymentStatus,
      paymentId: order.paymentId,
      invoiceNumber: order.invoiceNumber,
      invoiceUrl: order.invoiceUrl,
      createdAt: order.createdAt.getTime(),
    }));
  }

  private async validateRefundEligibility(
    orderId: string,
    userId: string,
    items: Array<{ perfumeId: string; quantity: number; volume: number }>,
  ): Promise<{
    order: Order;
    totalRefundAmount: number;
    refundItems: Array<{
      perfumeId: Types.ObjectId;
      quantity: number;
      volume: number;
      refundAmount: number;
    }>;
  }> {
    const order = await this.OrderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.user.toString() !== userId) {
      throw new BadRequestException('Order does not belong to user');
    }

    if (order.status !== OrderStatusEnum.DELIVERED) {
      throw new BadRequestException(
        'Order must be delivered to request refund',
      );
    }

    if (order.paymentStatus !== OrderPaymentStatusEnum.COMPLETED) {
      throw new BadRequestException(
        'Order payment must be completed to request refund',
      );
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    if (order.createdAt < thirtyDaysAgo) {
      throw new BadRequestException('Refund period (30 days) has expired');
    }

    const refundItems = [];
    let totalRefundAmount = 0;

    for (const refundItem of items) {
      const orderItem = order.items.find(
        (item) => item.perfume.toString() === refundItem.perfumeId,
      );

      if (!orderItem) {
        throw new BadRequestException(
          `Order item not found: ${refundItem.perfumeId}`,
        );
      }

      if (refundItem.quantity > orderItem.quantity) {
        throw new BadRequestException(
          'Refund quantity cannot exceed ordered quantity',
        );
      }

      if (refundItem.volume !== orderItem.volume) {
        throw new BadRequestException(
          'Refund volume must match ordered volume',
        );
      }

      const itemDiscountRatio =
        order.campaignDiscountAmount / order.totalAmount;
      const itemRefundPrice = orderItem.price * (1 - itemDiscountRatio);
      const refundAmount = itemRefundPrice * refundItem.quantity;

      refundItems.push({
        perfumeId: orderItem.perfume,
        quantity: refundItem.quantity,
        volume: orderItem.volume,
        refundAmount,
      });

      totalRefundAmount += refundAmount;
    }

    return { order, totalRefundAmount, refundItems };
  }

  async createRefundRequest(
    orderId: string,
    input: CreateRefundRequestDto,
    userId: string,
  ): Promise<void> {
    const { totalRefundAmount, refundItems } =
      await this.validateRefundEligibility(orderId, userId, input.items);

    const existingRequest = await this.RefundRequestModel.findOne({
      order: new Types.ObjectId(orderId),
      status: {
        $in: [
          RefundRequestStatusEnum.PENDING,
          RefundRequestStatusEnum.REJECTED,
        ],
      },
      'items.perfumeId': {
        $in: input.items.map((item) => new Types.ObjectId(item.perfumeId)),
      },
    });

    if (existingRequest) {
      throw new BadRequestException(
        'A refund request already exists for one or more items',
      );
    }

    const refundRequest = new this.RefundRequestModel({
      user: new Types.ObjectId(userId),
      order: new Types.ObjectId(orderId),
      items: refundItems.map((item) => ({
        perfumeId: item.perfumeId,
        quantity: item.quantity,
        refundAmount: item.refundAmount,
      })),
      totalRefundAmount,
      status: RefundRequestStatusEnum.PENDING,
      createdAt: new Date(),
    });

    await refundRequest.save();
  }

  async getUserRefundRequests(userId: string): Promise<Array<any>> {
    const requests = await this.RefundRequestModel.find({
      user: new Types.ObjectId(userId),
    })
      .populate('order', 'createdAt invoiceNumber')
      .populate({
        path: 'items.perfumeId',
        model: Perfume.name,
        select: 'name brand',
      })
      .sort({ createdAt: -1 });

    return requests.map((request) => ({
      refundRequestId: request._id.toString(),
      orderId: request.order._id.toString(),
      orderDate: request.order.createdAt.getTime(),
      invoiceNumber: request.order.invoiceNumber,
      items: request.items.map((item) => ({
        perfumeName: (item.perfumeId as any as Perfume).name,
        brand: (item.perfumeId as any as Perfume).brand,
        quantity: item.quantity,
        refundAmount: item.refundAmount,
      })),
      totalRefundAmount: request.totalRefundAmount,
      status: request.status,
      rejectionReason: request.rejectionReason,
      createdAt: request.createdAt.getTime(),
      processedAt: request.processedAt?.getTime(),
    }));
  }

  async getAllRefundRequests(): Promise<Array<any>> {
    const requests = await this.RefundRequestModel.find()
      .populate('user', 'email firstName lastName')
      .populate('order', 'createdAt invoiceNumber')
      .populate({
        path: 'items.perfumeId',
        model: Perfume.name,
        select: 'name brand',
      })
      .sort({ createdAt: -1 });

    return requests.map((request) => ({
      refundRequestId: request._id.toString(),
      orderId: request.order._id.toString(),
      orderDate: request.order.createdAt.getTime(),
      invoiceNumber: request.order.invoiceNumber,
      userId: request.user._id.toString(),
      userEmail: request.user.email,
      userName: `${request.user.firstName} ${request.user.lastName}`,
      items: request.items.map((item) => ({
        perfumeName: (item.perfumeId as any as Perfume).name,
        brand: (item.perfumeId as any as Perfume).brand,
        quantity: item.quantity,
        refundAmount: item.refundAmount,
      })),
      totalRefundAmount: request.totalRefundAmount,
      status: request.status,
      rejectionReason: request.rejectionReason,
      createdAt: request.createdAt.getTime(),
      processedAt: request.processedAt?.getTime(),
    }));
  }

  async approveRefundRequest(refundRequestId: string): Promise<void> {

    try {
      const refundRequest =
        await this.RefundRequestModel.findById(refundRequestId).populate(
          'order',
        );

      if (!refundRequest) {
        throw new NotFoundException('Refund request not found');
      }

      if (refundRequest.status !== RefundRequestStatusEnum.PENDING) {
        throw new BadRequestException(
          'Refund request is not in pending status',
        );
      }

      refundRequest.status = RefundRequestStatusEnum.APPROVED;
      refundRequest.processedAt = new Date();
      await refundRequest.save();

      for (const item of refundRequest.items) {
        await this.PerfumeModel.updateOne(
          {
            _id: item.perfumeId,
            'variants.volume': refundRequest.order.items.find((orderItem) =>
              (orderItem.perfume as Types.ObjectId).equals(item.perfumeId),
            ).volume,
          },
          {
            $inc: { 'variants.$.stock': item.quantity },
          },
        );
      
        const orderItem = refundRequest.order.items.find((oItem) =>
          (oItem.perfume as Types.ObjectId).equals(item.perfumeId),
        );
      
        if (orderItem) {
          if (orderItem.quantity === item.quantity) {
            await this.OrderModel.updateOne(
              { _id: refundRequest.order._id },
              {
                $pull: { 
                  items: { 
                    perfume: orderItem.perfume,
                    volume: orderItem.volume 
                  } 
                },
                $inc: { totalAmount: -item.refundAmount },
              },
            );
          } else {
            const updatedTotalPrice = orderItem.price * (orderItem.quantity - item.quantity);
            await this.OrderModel.updateOne(
              { 
                _id: refundRequest.order._id,
                'items.perfume': orderItem.perfume,
                'items.volume': orderItem.volume
              },
              {
                $inc: { 
                  'items.$.quantity': -item.quantity,
                  totalAmount: -item.refundAmount 
                },
                $set: { 'items.$.totalPrice': updatedTotalPrice }
              },
            );
          }
        }
      }
      
      const updatedOrder = await this.OrderModel.findById(refundRequest.order._id);
      if (updatedOrder.items.length === 0) {
        await this.OrderModel.updateOne(
          { _id: refundRequest.order._id },
          { 
            $set: { 
              status: OrderStatusEnum.REFUNDED,
              paymentStatus: OrderPaymentStatusEnum.REFUNDED 
            }
          },
        );
      }

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw error;
    }
  }

  async rejectRefundRequest(
    refundRequestId: string,
    rejectionReason: string,
  ): Promise<void> {
    const refundRequest =
      await this.RefundRequestModel.findById(refundRequestId);

    if (!refundRequest) {
      throw new NotFoundException('Refund request not found');
    }

    if (refundRequest.status !== RefundRequestStatusEnum.PENDING) {
      throw new BadRequestException('Refund request is not in pending status, cannot be rejected');
    }

    refundRequest.status = RefundRequestStatusEnum.REJECTED;
    refundRequest.rejectionReason = rejectionReason;
    refundRequest.processedAt = new Date();

    await refundRequest.save();
  }
}
