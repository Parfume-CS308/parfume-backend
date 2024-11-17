import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Perfume } from '../entities/perfume.entity';
import { AllPerfumeItemDto } from './models/all_perfumes.response';
import { Types } from 'mongoose';
import { PerfumeDetailDto } from './models/perfume_detail.response';

@Injectable()
export class PerfumeService {
  constructor(
    @InjectModel(Perfume.name)
    private readonly PerfumeModel: Model<Perfume>,
  ) {}

  async getAllPerfumes(): Promise<AllPerfumeItemDto[]> {
    const allPerfumes = await this.PerfumeModel.find(
      {},
      {
        _id: 1,
        name: 1,
        brand: 1,
        notes: 1,
        type: 1,
        assetUrl: 1,
        season: 1,
        sillage: 1,
        longevity: 1,
        gender: 1,
        description: 1,
        serialNumber: 1,
        warrantyStatus: 1,
        distributor: 1,
        categories: 1,
        variants: 1,
      },
    )
      .populate('distributor')
      .populate('categories');
    const parsedPerfumes: AllPerfumeItemDto[] = allPerfumes.map(
      (perfume: Perfume) => ({
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
      }),
    );
    return parsedPerfumes;
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
