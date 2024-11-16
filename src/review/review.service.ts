import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Perfume } from 'src/entities/perfume.entity';
import { Review } from 'src/entities/review.entity';
import { User } from 'src/entities/user.entity';
import { AllReviewItemDto } from './models/all_review.response';
import { CreateReviewDto } from './dto/create_review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Perfume.name)
    private readonly PerfumeModel: Model<Perfume>,
    @InjectModel(Review.name)
    private readonly ReviewModel: Model<Review>,
    @InjectModel(User.name)
    private readonly UserModel: Model<User>,
  ) {}

  async getPublicReviews(perfumeId: string): Promise<AllReviewItemDto[]> {
    const reviews = await this.ReviewModel.find(
      { perfume: new Types.ObjectId(perfumeId), isApproved: true },
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
      .sort({ createdAt: -1 });
    return reviews.map((review) => ({
      id: (review._id as Types.ObjectId).toHexString(),
      user: `${review.user.firstName} ${review.user.lastName}`,
      rating: review.rating,
      comment: review.comment,
      isApproved: review.isApproved,
      approvedAt: review.approvedAt.getTime(),
      createdAt: review.createdAt.getTime(),
    }));
  }

  async getAllReviews(perfumeId: string): Promise<AllReviewItemDto[]> {
    const reviews = await this.ReviewModel.find(
      { perfume: new Types.ObjectId(perfumeId) },
      {
        _id: 1,
        user: 1,
        rating: 1,
        comment: 1,
        isApproved: 1,
        approvedAt: 1,
        createdAt: 1,
      },
    )
      .populate('user')
      .sort({ createdAt: -1 });
    return reviews.map((review) => ({
      id: (review._id as Types.ObjectId).toHexString(),
      user: `${review.user.firstName} ${review.user.lastName}`,
      rating: review.rating,
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
      rating: input.rating,
      comment: input.comment,
      isApproved: false,
      createdAt: new Date(),
    });
    await review.save();
  }
}
