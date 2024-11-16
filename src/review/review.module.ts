import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Perfume, PerfumeSchema } from 'src/entities/perfume.entity';
import { Review, ReviewSchema } from 'src/entities/review.entity';
import { User, UserSchema } from 'src/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Perfume.name,
        schema: PerfumeSchema,
      },
      {
        name: Review.name,
        schema: ReviewSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    AuthModule,
  ],
  providers: [ReviewService],
  controllers: [ReviewController],
})
export class ReviewModule {}
