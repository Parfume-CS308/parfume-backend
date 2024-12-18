import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Perfume } from '../entities/perfume.entity';
import { Review } from '../entities/review.entity';
import { User } from '../entities/user.entity';
import { AllReviewItemDto } from './models/all_review.response';
import { CreateReviewDto } from './dto/create_review.dto';
import { AuthService } from 'src/auth/auth.service';
import { AuthTokenPayload } from 'src/auth/interfaces/auth-types';
import { Rating } from 'src/entities/rating.entity';
import { PerfumeRatingResponse } from './models/rating.response';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Perfume.name)
    private readonly PerfumeModel: Model<Perfume>,
    @InjectModel(Review.name)
    private readonly ReviewModel: Model<Review>,
    @InjectModel(User.name)
    private readonly UserModel: Model<User>,
    @InjectModel(Rating.name)
    private readonly Rating: Model<Rating>,
    private authService: AuthService,
  ) {}

  async ratePerfume(
    perfumeId: string,
    rating: number,
    userId: string,
  ): Promise<void> {
    const perfume = await this.PerfumeModel.findById(perfumeId);
    if (!perfume) {
      throw new BadRequestException('Perfume not found');
    }
    if (rating < 0 || rating > 5) {
      throw new BadRequestException('Rating must be between 0 and 5');
    }

    const userRating = await this.Rating.findOne({
      perfume: new Types.ObjectId(perfumeId),
      user: new Types.ObjectId(userId),
    });
    if (userRating) {
      await this.Rating.updateOne(
        { _id: userRating._id },
        { rating, createdAt: new Date() },
      );
    } else {
      const newRating = new this.Rating({
        user: new Types.ObjectId(userId),
        perfume: new Types.ObjectId(perfumeId),
        rating,
        createdAt: new Date(),
      });
      await newRating.save();
    }
  }

  async validateUser(
    accessToken: string,
    refreshToken: string,
  ): Promise<AuthTokenPayload> {
    let payload: AuthTokenPayload;
    if (!accessToken) {
      return null;
    }
    try {
      payload = await this.authService.validateAccessToken(accessToken);
    } catch (accessTokenError) {
      if (!refreshToken) {
        throw null;
      }
      try {
        payload = await this.authService.validateRefreshToken(refreshToken);
      } catch (refreshTokenError) {
        return null;
      }
    }
    return payload;
  }

  async getRating(
    perfumeId: string,
    req: AuthenticatedRequest,
  ): Promise<PerfumeRatingResponse> {
    const userDetails = await this.validateUser(
      req.cookies['access_token'],
      req.cookies['refresh_token'],
    );
    const allRatings = await this.Rating.find({
      perfume: new Types.ObjectId(perfumeId),
    });
    const averageRating = allRatings.reduce(
      (acc, rating) => acc + rating.rating,
      0,
    );
    const totalRatings = allRatings.length;

    const ratingCounts = allRatings.reduce((acc, rating) => {
      acc[rating.rating] = (acc[rating.rating] || 0) + 1;
      return acc;
    }, {});

    if (!userDetails) {
      return {
        averageRating: totalRatings ? averageRating / totalRatings : 0,
        ratingCount: totalRatings,
        userRating: null,
        isRated: false,
        ratingCounts: ratingCounts,
      };
    }
    const userRating = allRatings.find(
      (rating) => rating.user.toString() === userDetails.id,
    );
    const isRated = !!userRating;
    return {
      averageRating: totalRatings ? averageRating / totalRatings : 0,
      ratingCount: totalRatings,
      userRating: userRating ? userRating.rating : null,
      isRated,
      ratingCounts: ratingCounts,
    };
  }

  async getPublicReviews(perfumeId: string): Promise<AllReviewItemDto[]> {
    const reviews = await this.ReviewModel.find(
      { perfume: new Types.ObjectId(perfumeId) },
      {
        _id: 1,
        user: 1,
        rating: 1,
        isApproved: 1,
        comment: 1,
        approvedAt: 1,
        createdAt: 1,
      },
    )
      .populate('user')
      .populate('perfume')
      .sort({ createdAt: -1 });
    return reviews.map((review) => ({
      id: (review._id as Types.ObjectId).toHexString(),
      perfumeName: review.perfume.name,
      user: `${review.user.firstName} ${review.user.lastName}`,
      comment: review.comment,
      isApproved: review.isApproved,
      approvedAt: review.approvedAt?.getTime(),
      createdAt: review.createdAt.getTime(),
    }));
  }

  async getAllReviews(): Promise<AllReviewItemDto[]> {
    const reviews = await this.ReviewModel.find(
      {},
      {
        _id: 1,
        perfume: 1,
        user: 1,
        rating: 1,
        comment: 1,
        isApproved: 1,
        approvedAt: 1,
        createdAt: 1,
      },
    )
      .populate('user')
      .populate('perfume')
      .sort({ createdAt: -1 });
    return reviews.map((review) => ({
      id: (review._id as Types.ObjectId).toHexString(),
      perfumeName: review.perfume.name,
      user: `${review.user.firstName} ${review.user.lastName}`,
      comment: review.comment,
      isApproved: review.isApproved,
      approvedAt: review.isApproved ? review.approvedAt.getTime() : null,
      createdAt: review.createdAt.getTime(),
    }));
  }

  async deleteReview(reviewId: string, userId: string): Promise<void> {
    const review = await this.ReviewModel.findOne({
      _id: new Types.ObjectId(reviewId),
      user: userId,
    });
    if (!review) {
      throw new BadRequestException('Review not found');
    }
    await this.ReviewModel.deleteOne({ _id: new Types.ObjectId(reviewId) });
  }

  async approveReview(reviewId: string): Promise<void> {
    const review = await this.ReviewModel.findOne({
      _id: new Types.ObjectId(reviewId),
    });
    if (!review) {
      throw new BadRequestException('Review not found');
    }
    await this.ReviewModel.updateOne(
      { _id: new Types.ObjectId(reviewId) },
      { isApproved: true, approvedAt: new Date() },
    );
  }

  async rejectReview(reviewId: string): Promise<void> {
    const review = await this.ReviewModel.findOne({
      _id: new Types.ObjectId(reviewId),
    });
    if (!review) {
      throw new BadRequestException('Review not found');
    }
    await this.ReviewModel.deleteOne({ _id: new Types.ObjectId(reviewId) });
  }

  async createReview(
    perfumeId: string,
    input: CreateReviewDto,
    userId: string,
  ): Promise<void> {
    const perfume = await this.PerfumeModel.findById(perfumeId);
    if (!perfume) {
      throw new BadRequestException('Perfume not found');
    }
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const review = new this.ReviewModel({
      user: userId,
      perfume: perfume._id,
      comment: input.comment,
      isApproved: false,
      createdAt: new Date(),
    });
    await review.save();
  }
}
