import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as nodemailer from 'nodemailer';
import { Discount } from '../entities/discount.entity';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { DiscountDto, DiscountResponse } from './models/discount.response';
import { PerfumeService } from '../perfume/perfume.service';
import { WishlistService } from '../wishlist/wishlist.service';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { AllDiscountsResponse } from './models/all-discounts.response';

@Injectable()
export class DiscountService {
  private readonly logger = new Logger(DiscountService.name);

  constructor(
    @InjectModel(Discount.name) private discountModel: Model<Discount>,
    @Inject(forwardRef(() => PerfumeService))
    private perfumeService: PerfumeService,
    @Inject(forwardRef(() => WishlistService))
    private wishlistService: WishlistService,
  ) {}

  async createDiscount(
    userId: string,
    dto: CreateDiscountDto,
  ): Promise<DiscountResponse> {
    try {
      // Validate perfumes exist
      for (const perfumeId of dto.perfumeIds) {
        await this.perfumeService.getPerfumeById(perfumeId);
      }

      // check for existing discount with the same name
      const existingDiscount = await this.discountModel.findOne({
        name: dto.name,
      });
      if (existingDiscount) {
        throw new BadRequestException('Discount with this name already exists');
      }
      // check for if any of the perfumes are already in a discount
      const existingDiscounts = await this.discountModel.find({
        perfumes: { $in: dto.perfumeIds.map((id) => new Types.ObjectId(id)) },
      });
      if (existingDiscounts.length > 0) {
        throw new BadRequestException(
          'One or more perfumes are already in a discount',
        );
      }

      const discount = await this.discountModel.create({
        ...dto,
        createdBy: new Types.ObjectId(userId),
        perfumes: dto.perfumeIds.map((id) => new Types.ObjectId(id)),
      });

      // Notify users who have these perfumes in their wishlists
      await this.notifyUsersAboutDiscount(dto.perfumeIds, discount);

      return {
        message: 'Successfully created discount',
        item: await this.mapDiscountToDto(discount),
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to create discount: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to create discount');
    }
  }

  private async notifyUsersAboutDiscount(
    perfumeIds: string[],
    discount: Discount,
  ): Promise<void> {
    try {
      // Get all users who have these perfumes in their wishlists
      const emailsToNotify =
        await this.wishlistService.getUsersWithPerfumesInWishlist(perfumeIds);

      // Get perfume details for the email
      const perfumes = await Promise.all(
        perfumeIds.map((id) => this.perfumeService.getPerfumeById(id)),
      );

      // Send email notifications to each user
      for (const email of emailsToNotify) {
        await this.sendDiscountEmail(email, discount, perfumes);
      }
    } catch (error) {
      this.logger.error(
        `Failed to notify users about discount: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to send discount notifications',
      );
    }
  }

  private async sendDiscountEmail(
    email: string,
    discount: Discount,
    perfumes: any[],
  ): Promise<void> {
    const perfumesList = perfumes
      .map(
        (perfume) => `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${perfume.name}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${perfume.brand}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">$${perfume.variants[0].price.toFixed(2)}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">$${(perfume.variants[0].price * (1 - discount.discountRate / 100)).toFixed(2)}</td>
                </tr>
            `,
      )
      .join('');

    const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #333; text-align: center;">Special Discount Alert!</h1>
                <p>Dear Valued Customer,</p>
                
                <p>Great news! Items from your wishlist are now on sale with our "${discount.name}" campaign.</p>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Discount Details</h3>
                    <p>Discount Rate: ${discount.discountRate}%</p>
                    <p>Valid From: ${new Date(discount.startDate).toLocaleDateString()}</p>
                    <p>Valid Until: ${new Date(discount.endDate).toLocaleDateString()}</p>
                </div>

                <h3>Discounted Items from Your Wishlist:</h3>
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <thead>
                        <tr style="background-color: #f8f9fa;">
                            <th style="padding: 10px; text-align: left;">Perfume</th>
                            <th style="padding: 10px; text-align: left;">Brand</th>
                            <th style="padding: 10px; text-align: left;">Original Price</th>
                            <th style="padding: 10px; text-align: left;">Discounted Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${perfumesList}
                    </tbody>
                </table>
                
                <p style="margin-top: 20px;">Don't miss out on these amazing deals! Visit our website to take advantage of these special prices.</p>
                
                <p style="margin-top: 30px;">Best regards,<br>The Perfume Point Team</p>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
                    <p>Perfume Point - Your Premium Fragrance Destination</p>
                    <p>This is an automated email, please do not reply directly to this message.</p>
                </div>
            </div>
        `;

    const transporter = nodemailer.createTransport({
      host: 'smtp.resend.com',
      secure: true,
      port: 465,
      auth: {
        user: 'resend',
        pass: 're_MB44nE9S_FHpUwLFnQbUThBeVChevNCht',
      },
    });

    await transporter.sendMail({
      from: '"Perfume Point" <onboarding@resend.dev>',
      to: email,
      subject: `🎉 Special Discount Alert - Items from Your Wishlist Are on Sale!`,
      html: emailHtml,
    });

    this.logger.log(
      `Discount notification email sent to ${email}`,
      'DiscountService.sendDiscountEmail',
    );
  }

  private async mapDiscountToDto(discount: Discount): Promise<DiscountDto> {
    const perfumes = await Promise.all(
      discount.perfumes.map(async (perfumeId) => {
        const perfume = await this.perfumeService.getPerfumeById(
          perfumeId.toString(),
        );
        return {
          id: perfume.id,
          name: perfume.name,
          brand: perfume.brand,
          originalPrice: perfume.variants[0].price,
          discountedPrice:
            perfume.variants[0].price * (1 - discount.discountRate / 100),
        };
      }),
    );

    return {
      id: discount._id.toString(),
      name: discount.name,
      discountRate: discount.discountRate,
      startDate: discount.startDate,
      endDate: discount.endDate,
      active: discount.active,
      perfumes,
      createdBy: discount.createdBy.toString(),
    };
  }

  async getActiveDiscountForPerfume(
    perfumeId: string,
  ): Promise<Discount | null> {
    const now = new Date();
    return this.discountModel.findOne({
      perfumes: {
        $in: [new Types.ObjectId(perfumeId)],
      },
      startDate: { $lte: now },
      endDate: { $gte: now },
      active: true,
    });
  }

  async calculateDiscountedPrice(
    originalPrice: number,
    perfumeId: string,
  ): Promise<number> {
    const activeDiscount = await this.getActiveDiscountForPerfume(perfumeId);
    if (!activeDiscount) {
      return originalPrice;
    }
    return (
      Math.floor(
        originalPrice * (1 - activeDiscount.discountRate / 100) * 100,
      ) / 100
    );
  }

  async updateDiscount(
    userId: string,
    discountId: string,
    dto: UpdateDiscountDto,
  ): Promise<DiscountResponse> {
    try {
      const discount = await this.discountModel.findById(discountId);

      if (!discount) {
        throw new NotFoundException('Discount not found');
      }

      // Check if user is the creator of the discount
      if (discount.createdBy.toString() !== userId) {
        throw new BadRequestException('Not authorized to update this discount');
      }

      // If perfume IDs are being updated, validate them
      if (dto.perfumeIds) {
        for (const perfumeId of dto.perfumeIds) {
          await this.perfumeService.getPerfumeById(perfumeId);
        }
      }

      // Update the discount
      const updatedDiscount = await this.discountModel.findByIdAndUpdate(
        discountId,
        {
          ...dto,
          perfumes: dto.perfumeIds?.map((id) => new Types.ObjectId(id)),
        },
        { new: true },
      );

      // If discount rate or perfumes changed, notify affected users
      if (dto.discountRate || dto.perfumeIds) {
        await this.notifyUsersAboutDiscount(
          dto.perfumeIds || discount.perfumes.map((p) => p.toString()),
          updatedDiscount,
        );
      }

      return {
        message: 'Successfully updated discount',
        item: await this.mapDiscountToDto(updatedDiscount),
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to update discount: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to update discount');
    }
  }

  async deleteDiscount(
    userId: string,
    discountId: string,
  ): Promise<{ message: string }> {
    try {
      const discount = await this.discountModel.findById(discountId);

      if (!discount) {
        throw new NotFoundException('Discount not found');
      }

      // Check if user is the creator of the discount
      if (discount.createdBy.toString() !== userId) {
        throw new BadRequestException('Not authorized to delete this discount');
      }

      await this.discountModel.findByIdAndDelete(discountId);

      return { message: 'Successfully deleted discount' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to delete discount: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to delete discount');
    }
  }

  async getAllDiscounts(): Promise<AllDiscountsResponse> {
    try {
      const discounts = await this.discountModel.find().sort({ createdAt: -1 });
      const mappedDiscounts = await Promise.all(
        discounts.map((discount) => this.mapDiscountToDto(discount)),
      );

      return {
        message: 'Successfully fetched all discounts',
        items: mappedDiscounts,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch discounts: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch discounts');
    }
  }
}
