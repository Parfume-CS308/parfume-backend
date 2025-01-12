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
import { Wishlist } from '../entities/wishlist.entity';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { RemoveFromWishlistDto } from './dto/remove-from-wishlist.dto';
import { WishlistResponse } from './models/wishlist.response';
import { PerfumeService } from '../perfume/perfume.service';
import { AllPerfumeItemDto } from 'src/perfume/models/all_perfumes.response';

@Injectable()
export class WishlistService {
  private readonly logger = new Logger(WishlistService.name);

  constructor(
    @InjectModel(Wishlist.name) private wishlistModel: Model<Wishlist>,
    @Inject(forwardRef(() => PerfumeService))
    private perfumeService: PerfumeService,
  ) {}

  async getWishlist(userId: string): Promise<WishlistResponse> {
    try {
      const userIdObj = new Types.ObjectId(userId);
      const wishlist = await this.wishlistModel
        .findOne({ user: userIdObj })
        .lean();

      if (!wishlist) {
        Logger.log(
          `Wishlist not found for user ${userId}, creating a new one`,
          'WishlistService.getWishlist',
        );
        await this.wishlistModel.create({ user: userIdObj, perfumes: [] });
        return {
          message: 'Successfully fetched wishlist items',
          items: [],
        };
      }

      const perfumeDetails: AllPerfumeItemDto[] = [];

      for (const perfumeId of wishlist.perfumes) {
        Logger.log(
          `Fetching perfume with id ${perfumeId}`,
          'WishlistService.getWishlist',
        );
        try {
          const perfume = await this.perfumeService.getPerfumeById(
            (perfumeId as unknown as Types.ObjectId).toHexString(),
          );
          perfumeDetails.push(perfume);
        } catch (error) {
          this.logger.error(
            `Failed to get perfume with id ${perfumeId}`,
            error.stack,
          );
        }
      }

      return {
        message: 'Successfully fetched wishlist items',
        items: perfumeDetails,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get wishlist for user ${userId}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to get wishlist');
    }
  }

  async addToWishlist(
    userId: string,
    dto: AddToWishlistDto,
  ): Promise<WishlistResponse> {
    try {
      const userIdObj = new Types.ObjectId(userId);
      const wishlist = await this.wishlistModel.findOne({ user: userIdObj });
      const parsedParfumeId = new Types.ObjectId(dto.perfumeId);
      if (!wishlist) {
        Logger.log(
          'Wishlist not found, creating a new one',
          'WishlistService.addToWishlist',
        );
        await this.wishlistModel.create({
          user: userIdObj,
          perfumes: [parsedParfumeId],
        });
        return this.getWishlist(userId);
      }

      const isPerfumeExists = await this.perfumeService.getPerfumeById(
        dto.perfumeId,
      );

      if (!isPerfumeExists) {
        throw new NotFoundException('Perfume not found');
      }

      if (
        !(wishlist.perfumes as unknown as Types.ObjectId[]).includes(
          parsedParfumeId,
        )
      ) {
        (wishlist.perfumes as unknown as Types.ObjectId[]).push(
          parsedParfumeId,
        );
        await wishlist.save();
      } else {
        throw new BadRequestException('Perfume already exists in wishlist');
      }

      return this.getWishlist(userId);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to add item to wishlist for user ${userId}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to add item to wishlist');
    }
  }

  async removeFromWishlist(
    userId: string,
    dto: RemoveFromWishlistDto,
  ): Promise<WishlistResponse> {
    try {
      const userIdObj = new Types.ObjectId(userId);
      const wishlist = await this.wishlistModel.findOne({ user: userIdObj });

      if (!wishlist) {
        throw new NotFoundException('Wishlist not found');
      }

      const perfumeExists = wishlist.perfumes.some(
        (id) => id.toString() === dto.perfumeId,
      );

      if (!perfumeExists) {
        throw new BadRequestException('Perfume not found in wishlist');
      }

      wishlist.perfumes = wishlist.perfumes.filter(
        (id) => id.toString() !== dto.perfumeId,
      );
      await wishlist.save();

      return this.getWishlist(userId);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to remove item from wishlist for user ${userId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to remove item from wishlist',
      );
    }
  }

  async clearWishlist(userId: string): Promise<void> {
    try {
      const userIdObj = new Types.ObjectId(userId);
      const wishlist = await this.wishlistModel.findOne({ user: userIdObj });

      if (!wishlist) {
        throw new NotFoundException('Wishlist not found');
      }

      wishlist.perfumes = [];
      await wishlist.save();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to clear wishlist for user ${userId}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to clear wishlist');
    }
  }

  async getUsersWithPerfumesInWishlist(perfumeIds: string[]) {
    const parsedPerfumeIds = perfumeIds.map((id) => new Types.ObjectId(id));
    const wishlists = await this.wishlistModel
      .find({
        perfumes: { $in: parsedPerfumeIds },
      })
      .populate('user', 'email');

    const allUsersEmail = wishlists.map((wishlist) => wishlist.user.email);

    const allDistinctUsersEmail = Array.from(new Set(allUsersEmail));
    return allDistinctUsersEmail;
  }
}
