import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart } from '../entities/cart.entity';
import { Perfume } from '../entities/perfume.entity';
import { CartDetailDto } from './models/cart_details.response';
import { SyncCartItemDto } from './dto/sync_cart.dto';
import { DiscountService } from 'src/discount/discount.service';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name)
    private readonly CartModel: Model<Cart>,

    @InjectModel(Perfume.name)
    private readonly PerfumeModel: Model<Perfume>,

    private discountService: DiscountService,
  ) {}

  async getCartDetails(userId: string): Promise<CartDetailDto> {
    const cart = await this.CartModel.findOne({
      user: new Types.ObjectId(userId),
    }).populate('items.perfume');

    if (!cart) {
      const newCart = new this.CartModel({
        user: new Types.ObjectId(userId),
        items: [],
      });
      await newCart.save();
      return {
        id: newCart._id.toString(),
        items: [],
        totalPrice: 0,
        totalDiscountedPrice: 0,
      };
    }

    let totalPrice = 0;
    let totalDiscountedPrice = 0;

    const perfumeItemDetails = await Promise.all(
      cart.items.map(async (item) => {
        const perfume = item.perfume as Perfume;
        const variant = perfume.variants.find((v) => v.volume === item.volume);

        if (!variant) {
          throw new BadRequestException(
            `Invalid volume for item ${perfume.name}`,
          );
        }
        const discountedPrice =
          await this.discountService.calculateDiscountedPrice(
            variant.price,
            item.perfume._id.toString(),
          );
        totalPrice += variant.price * item.quantity;
        totalDiscountedPrice = discountedPrice * item.quantity;
        return {
          perfumeId: perfume._id.toString(),
          perfumeName: perfume.name,
          brand: perfume.brand,
          volume: item.volume,
          quantity: item.quantity,
          price: variant.price,
          discountedPrice,
        };
      }),
    );

    return {
      id: cart._id.toString(),
      items: perfumeItemDetails,
      totalPrice,
      totalDiscountedPrice,
    };
  }

  async validateCartItems(items: SyncCartItemDto[]): Promise<boolean> {
    try {
      for (const item of items) {
        const perfume = await this.PerfumeModel.findById(item.perfume);
        if (!perfume) {
          return false;
        }

        if (item.quantity < 1) {
          return false;
        }

        const validVolume = perfume.variants.some(
          (variant) =>
            variant.volume === item.volume &&
            variant.active &&
            variant.stock >= item.quantity,
        );

        if (!validVolume) {
          return false;
        }
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  async addItemsToCart(
    userId: string,
    items: SyncCartItemDto[],
  ): Promise<CartDetailDto> {
    const isValid = await this.validateCartItems(items);
    if (!isValid) {
      throw new BadRequestException(
        'Invalid perfume id, volume, or insufficient stock',
      );
    }

    const cart = await this.CartModel.findOne({
      user: new Types.ObjectId(userId),
    });

    if (!cart) {
      const newCart = new this.CartModel({
        user: new Types.ObjectId(userId),
        items: items.map((item) => ({
          perfume: new Types.ObjectId(item.perfume),
          volume: item.volume,
          quantity: item.quantity,
        })),
      });
      await newCart.save();
      return this.getCartDetails(userId);
    }
    items.forEach((item) => {
      const existingItemIndex = cart.items.findIndex(
        (cartItem) =>
          cartItem.perfume.toString() === item.perfume &&
          cartItem.volume === item.volume,
      );

      if (existingItemIndex !== -1) {
        cart.items[existingItemIndex].quantity += item.quantity;
      } else {
        cart.items.push({
          perfume: new Types.ObjectId(item.perfume),
          volume: item.volume,
          quantity: item.quantity,
        });
      }
    });

    await cart.save();
    return this.getCartDetails(userId);
  }

  async removeItemFromCart(
    userId: string,
    perfumeId: string,
    volume: number,
    quantity: number,
  ): Promise<CartDetailDto> {
    const cart = await this.CartModel.findOne({
      user: new Types.ObjectId(userId),
    });

    if (!cart) {
      throw new BadRequestException('Cart not found');
    }

    const itemToBeRemoved = cart.items.find(
      (item) => item.perfume.toString() === perfumeId && item.volume === volume,
    );

    cart.items = cart.items.filter(
      (item) => item.perfume.toString() !== perfumeId || item.volume !== volume,
    );

    if (!itemToBeRemoved || itemToBeRemoved.quantity < quantity) {
      throw new BadRequestException('Item not found in cart');
    }

    if (itemToBeRemoved.quantity === quantity) {
      cart.items = cart.items.filter(
        (item) =>
          item.perfume.toString() !== perfumeId || item.volume !== volume,
      );
    } else {
      itemToBeRemoved.quantity -= quantity;
      cart.items.push(itemToBeRemoved);
    }

    await cart.save();
    return this.getCartDetails(userId);
  }

  async removeFromCart(
    userId: string,
    perfumeId: string,
    volume: number,
  ): Promise<CartDetailDto> {
    const cart = await this.CartModel.findOne({
      user: new Types.ObjectId(userId),
    });

    if (!cart) {
      throw new BadRequestException('Cart not found');
    }

    cart.items = cart.items.filter(
      (item) => item.perfume.toString() !== perfumeId || item.volume !== volume,
    );

    await cart.save();
    return this.getCartDetails(userId);
  }

  async updateItemQuantity(
    userId: string,
    perfumeId: string,
    volume: number,
    quantity: number,
  ): Promise<CartDetailDto> {
    if (quantity < 1) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    const cart = await this.CartModel.findOne({
      user: new Types.ObjectId(userId),
    });

    if (!cart) {
      throw new BadRequestException('Cart not found');
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.perfume.toString() === perfumeId && item.volume === volume,
    );

    if (itemIndex === -1) {
      throw new BadRequestException('Item not found in cart');
    }

    const perfume = await this.PerfumeModel.findById(perfumeId);
    const variant = perfume.variants.find((v) => v.volume === volume);

    if (!variant || !variant.active || variant.stock < quantity) {
      throw new BadRequestException('Invalid quantity or insufficient stock');
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    return this.getCartDetails(userId);
  }

  async syncCart(
    userId: string,
    items: SyncCartItemDto[],
  ): Promise<CartDetailDto> {
    const isValid = await this.validateCartItems(items);
    if (!isValid) {
      throw new BadRequestException(
        'Invalid perfume id, volume, or insufficient stock',
      );
    }

    const cart = await this.CartModel.findOne({
      user: new Types.ObjectId(userId),
    });

    if (!cart) {
      const newCart = new this.CartModel({
        user: new Types.ObjectId(userId),
        items: items.map((item) => ({
          perfume: new Types.ObjectId(item.perfume),
          volume: item.volume,
          quantity: item.quantity,
        })),
      });
      await newCart.save();
      return this.getCartDetails(userId);
    }

    cart.items = items.map((item) => ({
      perfume: new Types.ObjectId(item.perfume),
      volume: item.volume,
      quantity: item.quantity,
    }));

    await cart.save();
    return this.getCartDetails(userId);
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await this.CartModel.findOne({
      user: new Types.ObjectId(userId),
    });

    if (cart) {
      cart.items = [];
      await cart.save();
    }
  }

  async getCartItemsCount(userId: string): Promise<number> {
    const cart = await this.CartModel.findOne({
      user: new Types.ObjectId(userId),
    });

    if (!cart) {
      return 0;
    }

    return cart.items.reduce((total, item) => total + item.quantity, 0);
  }
}
