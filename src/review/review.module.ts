import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Perfume, PerfumeSchema } from '../entities/perfume.entity';
import { Review, ReviewSchema } from '../entities/review.entity';
import { User, UserSchema } from '../entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { Rating, RatingSchema } from 'src/entities/rating.entity';

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
      {
        name: Rating.name,
        schema: RatingSchema,
      },
    ]),
    AuthModule,
  ],
  providers: [ReviewService],
  controllers: [ReviewController],
})
export class ReviewModule {}
