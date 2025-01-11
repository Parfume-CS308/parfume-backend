import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Perfume } from '../entities/perfume.entity';
import { AllPerfumeItemDto } from './models/all_perfumes.response';
import { Types } from 'mongoose';
import { PerfumeDetailDto } from './models/perfume_detail.response';
import { PerfumeFilterDto, PerfumeSortingEnum } from './dto/get_perfumes.dto';
import { DiscountService } from '../discount/discount.service';
import { CreatePerfumeDto } from './dto/create_perfume.dto';
import { Category } from 'src/entities/category.entity';

@Injectable()
export class PerfumeService {
  constructor(
    @InjectModel(Perfume.name)
    private readonly PerfumeModel: Model<Perfume>,
    @InjectModel(Category.name)
    private readonly CategoryModel: Model<Category>,
    @Inject(forwardRef(() => DiscountService))
    private discountService: DiscountService,
  ) {}

  async getAllPerfumes(
    filterDto: PerfumeFilterDto,
  ): Promise<AllPerfumeItemDto[]> {
    const filter: any = {};
    const aggregatePipeline: any[] = [];

    if (filterDto.categoryIds?.length) {
      filter.categories = {
        $in: filterDto.categoryIds.map((id) => new Types.ObjectId(id)),
      };
    }

    if (filterDto.brands?.length) {
      filter.brand = {
        $in: filterDto.brands,
      };
    }

    if (filterDto.genders?.length) {
      filter.gender = { $in: filterDto.genders };
    }

    if (filterDto.type.length) {
      filter.type = { $in: filterDto.type };
    }

    if (filterDto.minPrice !== -1 || filterDto.maxPrice !== -1) {
      filter['variants.price'] = {};
      if (filterDto.minPrice !== -1) {
        filter['variants.price'].$gte = filterDto.minPrice;
      }
      if (filterDto.maxPrice !== -1) {
        filter['variants.price'].$lte = filterDto.maxPrice;
      }
    }

    aggregatePipeline.push({ $match: filter });

    aggregatePipeline.push({
      $lookup: {
        from: 'ratings',
        localField: '_id',
        foreignField: 'perfume',
        pipeline: [
          {
            $group: {
              _id: null,
              averageRating: { $avg: '$rating' },
              reviewCount: { $sum: 1 },
            },
          },
        ],
        as: 'reviewStats',
      },
    });

    aggregatePipeline.push({
      $addFields: {
        averageRating: {
          $ifNull: [{ $arrayElemAt: ['$reviewStats.averageRating', 0] }, 0],
        },
        reviewCount: {
          $ifNull: [{ $arrayElemAt: ['$reviewStats.reviewCount', 0] }, 0],
        },
      },
    });

    aggregatePipeline.push(
      {
        $lookup: {
          from: 'distributors',
          localField: 'distributor',
          foreignField: '_id',
          as: 'distributor',
        },
      },
      { $unwind: '$distributor' },
      {
        $lookup: {
          from: 'categories',
          localField: 'categories',
          foreignField: '_id',
          as: 'categories',
        },
      },
    );

    switch (filterDto.sortBy) {
      case PerfumeSortingEnum.PRICE_ASC:
        aggregatePipeline.push({ $sort: { 'variants.price': 1 } });
        break;
      case PerfumeSortingEnum.PRICE_DESC:
        aggregatePipeline.push({ $sort: { 'variants.price': -1 } });
        break;
      case PerfumeSortingEnum.RATING:
        aggregatePipeline.push({
          $sort: { averageRating: -1, reviewCount: -1 },
        });
        break;
      case PerfumeSortingEnum.NAME_ASC:
        aggregatePipeline.push({ $sort: { name: 1 } });
        break;
      case PerfumeSortingEnum.NAME_DESC:
        aggregatePipeline.push({ $sort: { name: -1 } });
        break;
      case PerfumeSortingEnum.NEWEST:
        aggregatePipeline.push({ $sort: { createdAt: -1 } });
        break;
      case PerfumeSortingEnum.OLDEST:
        aggregatePipeline.push({ $sort: { createdAt: 1 } });
        break;
      case PerfumeSortingEnum.BEST_SELLER:
      default:
        aggregatePipeline.push({ $sort: { totalSales: -1 } });
        break;
    }

    let perfumes = await this.PerfumeModel.aggregate(aggregatePipeline);
    if (filterDto.rating) {
      perfumes = perfumes.filter(
        (perfume) => perfume.averageRating >= filterDto.rating,
      );
    }

    return await Promise.all(
      perfumes.map(async (perfume) => {
        const activeDiscount =
          await this.discountService.getActiveDiscountForPerfume(
            perfume._id.toHexString(),
          );

        return {
          id: perfume._id.toHexString(),
          name: perfume.name,
          brand: perfume.brand,
          notes: perfume.notes,
          type: perfume.type,
          assetUrl: perfume.assetUrl,
          season: perfume.season,
          sillage: perfume.sillage,
          longevity: perfume.longevity,
          gender: perfume.gender,
          description: perfume.description,
          serialNumber: perfume.serialNumber,
          warrantyStatus: perfume.warrantyStatus,
          averageRating: perfume.averageRating,
          reviewCount: perfume.reviewCount,
          distributor: {
            name: perfume.distributor.name,
            contactPerson: perfume.distributor.contactPerson,
            email: perfume.distributor.email,
            phone: perfume.distributor.phone,
            address: perfume.distributor.address,
          },
          categories: perfume.categories.map((category) => ({
            id: category._id.toHexString(),
            name: category.name,
            description: category.description,
          })),
          variants: perfume.variants.map((variant) => ({
            volume: variant.volume,
            price: variant.price,
            stock: variant.stock,
            active: variant.active,
          })),
          activeDiscount: activeDiscount
            ? {
                name: activeDiscount.name,
                rate: activeDiscount.discountRate,
                endDate: activeDiscount.endDate,
              }
            : null,
        };
      }),
    );
  }

  async getPerfumeById(id: string): Promise<PerfumeDetailDto> {
    const perfume = await this.PerfumeModel.findById(id)
      .populate('distributor')
      .populate('categories');

    if (!perfume) {
      throw new BadRequestException('Perfume not found');
    }

    // Get active discount for this perfume
    const activeDiscount =
      await this.discountService.getActiveDiscountForPerfume(id);

    // Calculate discounted prices for variants if there's an active discount
    const variants = await Promise.all(
      perfume.variants.map(async (variant) => {
        const originalPrice = variant.price;
        const discountedPrice = activeDiscount
          ? originalPrice * (1 - activeDiscount.discountRate / 100)
          : originalPrice;

        return {
          volume: variant.volume,
          price: originalPrice,
          discountedPrice: discountedPrice,
          discountRate: activeDiscount?.discountRate || 0,
          stock: variant.stock,
          active: variant.active,
        };
      }),
    );

    return {
      id: perfume._id.toString(),
      name: perfume.name,
      brand: perfume.brand,
      notes: perfume.notes,
      type: perfume.type,
      assetUrl: perfume.assetUrl,
      season: perfume.season,
      sillage: perfume.sillage,
      longevity: perfume.longevity,
      gender: perfume.gender,
      description: perfume.description,
      serialNumber: perfume.serialNumber,
      warrantyStatus: perfume.warrantyStatus,
      distributor: {
        name: perfume.distributor.name,
        contactPerson: perfume.distributor.contactPerson,
        email: perfume.distributor.email,
        phone: perfume.distributor.phone,
        address: perfume.distributor.address,
      },
      categories: perfume.categories.map((category) => {
        return {
          id: (category._id as Types.ObjectId).toHexString(),
          name: category.name,
          description: category.description,
        };
      }),
      variants,
      activeDiscount: activeDiscount
        ? {
            name: activeDiscount.name,
            rate: activeDiscount.discountRate,
            endDate: activeDiscount.endDate,
          }
        : null,
    };
  }

  async createPerfume(createPerfumeDto: CreatePerfumeDto): Promise<Perfume> {
    // check for if the categories exist
    const categories = await this.CategoryModel.find({
      _id: { $in: createPerfumeDto.categories.map((category) => category.id) },
    });
    if (categories.length !== createPerfumeDto.categories.length) {
      throw new BadRequestException(
        'Invalid category id, some of the categories are not found',
      );
    }
    const perfume = new this.PerfumeModel({
      name: createPerfumeDto.name,
      brand: createPerfumeDto.brand,
      notes: createPerfumeDto.notes,
      type: createPerfumeDto.type,
      assetUrl: `http://localhost:8016/productImage/${createPerfumeDto.assetId}`,
      season: createPerfumeDto.season,
      sillage: createPerfumeDto.sillage,
      longevity: createPerfumeDto.longevity,
      gender: createPerfumeDto.gender,
      description: createPerfumeDto.description,
      serialNumber: createPerfumeDto.serialNumber,
      warrantyStatus: createPerfumeDto.warrantyStatus,
      distributor: createPerfumeDto.distributor,
      categories: createPerfumeDto.categories.map((categoryItem) => {
        return {
          id: new Types.ObjectId(categoryItem.id),
          name: categoryItem.name,
          description: categoryItem.description,
        };
      }),
      variants: createPerfumeDto.variants,
    });
    return perfume.save();
  }

  async removePerfume(perfumeId: string): Promise<void> {
    const result = await this.PerfumeModel.findByIdAndDelete(perfumeId);
    if (!result) {
      throw new NotFoundException('Perfume not found');
    }
  }

  async updatePerfume(
    perfumeId: string,
    updatePerfumeDto: CreatePerfumeDto,
  ): Promise<Perfume> {
    const perfume = await this.PerfumeModel.findById(perfumeId);
    if (!perfume) {
      throw new NotFoundException('Perfume not found');
    }
    const categories = await this.CategoryModel.find({
      _id: { $in: updatePerfumeDto.categories.map((category) => category.id) },
    });
    if (categories.length !== updatePerfumeDto.categories.length) {
      throw new BadRequestException(
        'Invalid category id, some of the categories are not found',
      );
    }
    const updatedPerfume = await this.PerfumeModel.findByIdAndUpdate(
      perfumeId,
      {
        name: updatePerfumeDto.name,
        brand: updatePerfumeDto.brand,
        notes: updatePerfumeDto.notes,
        type: updatePerfumeDto.type,
        assetUrl: `http://localhost:8016/productImage/${updatePerfumeDto.assetId}`,
        season: updatePerfumeDto.season,
        sillage: updatePerfumeDto.sillage,
        longevity: updatePerfumeDto.longevity,
        gender: updatePerfumeDto.gender,
        description: updatePerfumeDto.description,
        serialNumber: updatePerfumeDto.serialNumber,
        warrantyStatus: updatePerfumeDto.warrantyStatus,
        distributor: updatePerfumeDto.distributor,
        categories: updatePerfumeDto.categories.map((categoryItem) => {
          return {
            id: new Types.ObjectId(categoryItem.id),
            name: categoryItem.name,
            description: categoryItem.description,
          };
        }),
        variants: updatePerfumeDto.variants,
      },
      { new: true },
    );
    if (!updatedPerfume) {
      throw new NotFoundException('Perfume not found');
    }
    return updatedPerfume;
  }
}
