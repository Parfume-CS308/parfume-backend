// seed/seed.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from '../entities/category.entity';
import { Distributor } from '../entities/distributor.entity';
import { Perfume } from '../entities/perfume.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Category.name)
    private readonly Category: Model<Category>,
    @InjectModel(Distributor.name)
    private readonly Distributor: Model<Distributor>,
    @InjectModel(Perfume.name)
    private readonly Perfume: Model<Perfume>,
  ) {}

  async seed() {
    Logger.log('Seeding started', 'SeedService.seed');
    await this.seedCategories();
    await this.seedDistributors();
    await this.seedPerfumes();
    Logger.log('Seeding completed', 'SeedService.seed');
  }

  private async seedCategories() {
    const count = await this.Category.countDocuments();
    if (count > 0) {
      Logger.log(
        'Categories collection is not empty, skipping seeding',
        'SeedService.seedCategories',
      );
      return;
    }

    const categories = [
      {
        name: 'Men',
        description: 'Fragrances for men',
      },
      {
        name: 'Women',
        description: 'Fragrances for women',
      },
      {
        name: 'Unisex',
        description: 'Fragrances for everyone',
      },
      {
        name: 'Fresh',
        description: 'Fresh fragrances',
      },
      {
        name: 'Woody',
        description: 'Woody fragrances',
      },
      {
        name: 'Oriental',
        description: 'Oriental fragrances',
      },
    ];

    try {
      await this.Category.create(categories);
      Logger.log(
        'Categories seeded successfully',
        'SeedService.seedCategories',
      );
    } catch (error) {
      Logger.error(
        'Error seeding categories:',
        error,
        'SeedService.seedCategories',
      );
    }
  }

  private async seedDistributors() {
    const count = await this.Distributor.countDocuments();
    if (count > 0) {
      Logger.log(
        'Distributors collection is not empty, skipping seeding',
        'SeedService.seedDistributors',
      );
      return;
    }

    const distributors = [
      {
        name: 'Luxury Perfumes Inc.',
        contactPerson: 'John Doe',
        email: 'john@luxuryperfumes.com',
        phone: '+1234567890',
        address: '123 Luxury Street, Beverly Hills, CA 90210',
      },
      {
        name: 'European Fragrances Ltd.',
        contactPerson: 'Marie Claire',
        email: 'marie@eufragrances.com',
        phone: '+3399887766',
        address: '45 Champs-Élysées, Paris, France',
      },
      {
        name: 'Oriental Scents Co.',
        contactPerson: 'Ali Rahman',
        email: 'ali@orientalscents.com',
        phone: '+9715554433',
        address: 'Dubai Mall, Sheikh Zayed Road, Dubai, UAE',
      },
    ];

    try {
      await this.Distributor.create(distributors);
      Logger.log(
        'Distributors seeded successfully',
        'SeedService.seedDistributors',
      );
    } catch (error) {
      Logger.error(
        'Error seeding distributors:',
        error,
        'SeedService.seedDistributors',
      );
    }
  }

  private async seedPerfumes() {
    const count = await this.Perfume.countDocuments();
    if (count > 0) {
      Logger.log(
        'Perfumes collection is not empty, skipping seeding',
        'SeedService.seedPerfumes',
      );
      return;
    }

    // Get all categories and distributors
    const categories = await this.Category.find().lean();
    const distributors = await this.Distributor.find().lean();

    const perfumes = [
      {
        name: 'YSL Myself',
        brand: 'AquaScents',
        model: 'OB2024',
        assetUrl:
          'https://www.sephora.com.tr/dw/image/v2/BCZG_PRD/on/demandware.static/-/Sites-masterCatalog_Sephora/default/dwea6f35c1/images/hi-res/SKU/SKU_4486/701715_swatch.jpg?sw=585&sh=585&sm=fit',
        serialNumber: 123456,
        notes: ['citrus', 'marine', 'woody'],
        type: 'edt',
        season: 'summer',
        sillage: 'moderate',
        longevity: 'long',
        gender: 'unisex',
        description:
          'A fresh and invigorating scent reminiscent of ocean breeze',
        warrantyStatus: 12,
        distributor: distributors[0]._id,
        categories: [
          categories.find((c) => c.name === 'Unisex')._id,
          categories.find((c) => c.name === 'Fresh')._id,
        ],
        variants: [
          {
            volume: 50,
            price: 80,
            basePrice: 39,
            stock: 100,
            active: true,
          },
          {
            volume: 100,
            price: 140,
            basePrice: 80,
            stock: 75,
            active: true,
          },
        ],
      },
      {
        name: 'Xerjoff - Naxos 1861',
        brand: 'AquaScents',
        model: 'XR2024',
        assetUrl:
          'https://cdn.beymen.com/mnresize/1200/1672/productimages/0709001254_IMG_01_8033488155070.jpg',
        serialNumber: 345678,
        notes: ['honey', 'vanilla', 'tobacco'],
        type: 'edp',
        season: 'winter',
        sillage: 'strong',
        longevity: 'long',
        gender: 'unisex',
        description:
          'A bold, captivating fragrance that balances rich tobacco and honey notes with a fresh citrus twist, evoking Mediterranean elegance and modern sophistication.',
        warrantyStatus: 11,
        distributor: distributors[0]._id,
        categories: [
          categories.find((c) => c.name === 'Unisex')._id,
          categories.find((c) => c.name === 'Oriental')._id,
        ],
        variants: [
          {
            volume: 50,
            price: 120,
            basePrice: 69,
            stock: 1,
            active: true,
          },
          {
            volume: 100,
            price: 180,
            basePrice: 120,
            stock: 2,
            active: true,
          },
        ],
      },
      {
        name: 'Parfums De Marly - Layton',
        brand: 'LuxeParfums',
        model: 'MR2024',
        assetUrl:
          'https://cdn.beymen.com/productimages/gockoqfi.kjx_IMG_01_3700578518194.jpg',
        serialNumber: 234567,
        notes: ['rose', 'oud', 'vanilla'],
        type: 'edp',
        season: 'winter',
        sillage: 'strong',
        longevity: 'very long',
        gender: 'women',
        description: 'A sophisticated blend of rose and oriental notes',
        warrantyStatus: 6,
        distributor: distributors[1]._id,
        categories: [
          categories.find((c) => c.name === 'Women')._id,
          categories.find((c) => c.name === 'Oriental')._id,
        ],
        variants: [
          {
            volume: 50,
            price: 99.99,
            basePrice: 50,
            stock: 50,
            active: true,
          },
          {
            volume: 100,
            price: 159.99,
            basePrice: 82,
            stock: 30,
            active: true,
          },
        ],
      },
    ];

    try {
      await this.Perfume.create(perfumes);
      Logger.log('Perfumes seeded successfully', 'SeedService.seedPerfumes');
    } catch (error) {
      Logger.error(
        'Error seeding perfumes:',
        error,
        'SeedService.seedPerfumes',
      );
    }
  }
}
