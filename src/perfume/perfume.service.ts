import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Perfume } from '../entities/perfume.entity';
import { AllPerfumeItemDto } from './models/all_perfumes.response';
import { Types } from 'mongoose';
import { PerfumeDetailDto } from './models/perfume_detail.response';
import { PerfumeFilterDto, PerfumeSortingEnum } from './dto/get_perfumes.dto';

@Injectable()
export class PerfumeService {
  constructor(
    @InjectModel(Perfume.name)
    private readonly PerfumeModel: Model<Perfume>,
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

    // Price filter (needs to look into variants)
    if (filterDto.minPrice !== -1 || filterDto.maxPrice !== -1) {
      filter['variants.price'] = {};
      if (filterDto.minPrice !== -1) {
        filter['variants.price'].$gte = filterDto.minPrice;
      }
      if (filterDto.maxPrice !== -1) {
        filter['variants.price'].$lte = filterDto.maxPrice;
      }
    }

    // Start with basic match
    aggregatePipeline.push({ $match: filter });

    // Lookup reviews for average rating
    aggregatePipeline.push({
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'perfume',
        pipeline: [
          { $match: { isApproved: true } },
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

    // Unwind and set defaults for review stats
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

    // Populate necessary fields
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

    // Apply sorting
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

    const perfumes = await this.PerfumeModel.aggregate(aggregatePipeline);

    return perfumes.map((perfume) => ({
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
    }));
  }

  async getPerfumeById(id: string): Promise<PerfumeDetailDto> {
    const perfume = await this.PerfumeModel.findById(id)
      .populate('distributor')
      .populate('categories');
    if (!perfume) {
      throw new BadRequestException(
        'Perfume not found, please check the id that is provided',
      );
    }
    return {
      id: (perfume._id as Types.ObjectId).toHexString(),
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
      variants: perfume.variants.map((variant) => {
        return {
          volume: variant.volume,
          price: variant.price,
          stock: variant.stock,
          active: variant.active,
        };
      }),
    };
  }
}
