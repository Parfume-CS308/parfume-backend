import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EnvVault } from './vault/env.vault';
import { AuthModule } from './auth/auth.module';
import { User, UserSchema } from './entities/user.entity';
import { SeedModule } from './seed/seed.module';
import { PerfumeModule } from './perfume/perfume.module';
import { CategoryModule } from './category/category.module';
import { ReviewModule } from './review/review.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { UploadModule } from './upload/upload.module';
import { DownloadModule } from './download/download.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { ProductManagementModule } from './product_management/product_management.module';
import { DiscountModule } from './discount/discount.module';

@Module({
  imports: [
    MongooseModule.forRoot(EnvVault.MONGODB_CONNECTION_STRING, {
      dbName: 'perfume_point',
      auth: {
        username: EnvVault.MONGODB_USER,
        password: EnvVault.MONGODB_PASSWORD,
      },
    }),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    AuthModule,
    SeedModule,
    PerfumeModule,
    CategoryModule,
    ReviewModule,
    CartModule,
    OrderModule,
    UploadModule,
    DownloadModule,
    WishlistModule,
    ProductManagementModule,
    DiscountModule,
  ],
})
export class AppModule { }
