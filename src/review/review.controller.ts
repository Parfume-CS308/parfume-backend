import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards
} from '@nestjs/common'
import { ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ReviewService } from './review.service'
import { Response } from 'express'
import { AllReviewsResponse } from './models/all_review.response'
import { MessageResponse } from '../common/models/message.response'
import { AuthGuard } from '../guards/auth.guard'
import { RolesGuard } from '../guards/role.guard'
import { Roles } from '../decorators/role.decorator'
import { CreateReviewDto } from './dto/create_review.dto'
import { PerfumeIdDto } from './dto/perfume_id.dto'
import { User } from '../decorators/user.decorator'
import { AuthTokenPayload } from '../auth/interfaces/auth-types'
import { ObjectIdDto } from '../common/dto/object_id.dto'
import { PerfumeRatingResponse } from './models/rating.response'
import { CreateRatingDto } from './dto/create_rating.dto'

@Controller('review')
@ApiTags('Reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('/rating/:perfumeId')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Rate a perfume, for customers',
    description: 'Rate a perfume by its unique identifier'
  })
  @ApiOkResponse({
    description: 'Successfully fetched the average rating',
    type: PerfumeRatingResponse
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException
  })
  async ratePerfume(
    @Res() res: Response,
    @Param() paramInput: PerfumeIdDto,
    @Body() input: CreateRatingDto,
    @User() user: AuthTokenPayload
  ): Promise<Response<PerfumeRatingResponse>> {
    const { rating } = input
    try {
      Logger.log(`Rating perfume: ${paramInput.perfumeId} with rating: ${rating}`, 'ReviewController.ratePerfume')
      await this.reviewService.ratePerfume(paramInput.perfumeId, rating, user.id)
      Logger.log(
        `Successfully rated perfume: ${paramInput.perfumeId} with rating: ${rating}`,
        'ReviewController.ratePerfume'
      )
      return res.status(200).json({ message: 'Successfully rated the perfume' })
    } catch (error) {
      Logger.error(
        `Failed to rate perfume: ${paramInput.perfumeId} with rating: ${rating}`,
        error.stack,
        'ReviewController.ratePerfume'
      )
      throw new InternalServerErrorException('Failed to rate the perfume')
    }
  }

  @Get('/rating/:perfumeId')
  @ApiOperation({
    summary: 'Get the average rating for a perfume',
    description: 'Get the average rating for a perfume'
  })
  @ApiOkResponse({
    description: 'Successfully fetched the average rating',
    type: PerfumeRatingResponse
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException
  })
  async getRating(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Param() paramInput: PerfumeIdDto
  ): Promise<Response<PerfumeRatingResponse>> {
    try {
      Logger.log(`Fetching the average rating for perfume: ${paramInput.perfumeId}`, 'ReviewController.getRating')
      const rating = await this.reviewService.getRating(paramInput.perfumeId, req)
      Logger.log(
        `Successfully fetched the average rating for perfume: ${paramInput.perfumeId}`,
        'ReviewController.getRating'
      )
      return res.status(200).json({ message: 'Successfully fetched the average rating', rating })
    } catch (error) {
      Logger.error(
        `Failed to fetch the average rating for perfume: ${paramInput.perfumeId}`,
        error.stack,
        'ReviewController.getRating'
      )
      throw new InternalServerErrorException('Failed to fetch the average rating')
    }
  }

  @Get(':perfumeId/public')
  @ApiOperation({
    summary: 'Get all public reviews for a perfume',
    description: 'Get all public reviews for a perfume for display on the perfume page'
  })
  @ApiOkResponse({
    description: 'Successfully fetched all public reviews',
    type: AllReviewsResponse
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException
  })
  async getPublicReviews(
    @Res() res: Response,
    @Param() paramInput: PerfumeIdDto
  ): Promise<Response<AllReviewsResponse>> {
    try {
      Logger.log(
        `Fetching all public reviews for perfume: ${paramInput.perfumeId}`,
        'ReviewController.getPublicReviews'
      )
      const reviews = await this.reviewService.getPublicReviews(paramInput.perfumeId)
      Logger.log(
        `Successfully fetched all public reviews for perfume: ${paramInput.perfumeId} of count: ${reviews.length}`,
        'ReviewController.getPublicReviews'
      )
      return res.status(200).json({ message: 'Successfully fetched all public reviews', reviews })
    } catch (error) {
      Logger.error(
        `Failed to fetch all public reviews for perfume: ${paramInput.perfumeId}`,
        error.stack,
        'ReviewController.getPublicReviews'
      )
      throw new InternalServerErrorException('Failed to fetch public reviews')
    }
  }

  @Get('all')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('product-manager')
  @ApiOperation({
    summary: 'Get all reviews for a perfume, for perfume managers',
    description: 'Get all reviews for a perfume for perfume managers to review and approve'
  })
  @ApiOkResponse({
    description: 'Successfully fetched all reviews',
    type: AllReviewsResponse
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException
  })
  async getAllReviews(@Res() res: Response): Promise<Response<AllReviewsResponse>> {
    try {
      Logger.log(`Fetching all reviews for perfumes`, 'ReviewController.getAllReviews')
      const reviews = await this.reviewService.getAllReviews()
      Logger.log(
        `Successfully fetched all reviews for perfumes of count: ${reviews.length}`,
        'ReviewController.getAllReviews'
      )
      return res.status(200).json({ message: 'Successfully fetched all reviews', reviews })
    } catch (error) {
      Logger.error(`Failed to fetch all reviews for perfumes`, error.stack, 'ReviewController.getAllReviews')
      throw new InternalServerErrorException('Failed to fetch all reviews')
    }
  }

  @Post(':perfumeId')
  @UseGuards(AuthGuard)
  @Roles('customer', 'product-manager', 'sales-manager')
  @ApiOperation({
    summary: 'Create a review, for customers',
    description: 'Create a review for a perfume'
  })
  @ApiOkResponse({
    description: 'Successfully created the review',
    type: MessageResponse
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException
  })
  async createReview(
    @Res() res: Response,
    @Param() paramInput: PerfumeIdDto,
    @Body() input: CreateReviewDto,
    @User() user: AuthTokenPayload
  ): Promise<Response<MessageResponse>> {
    try {
      Logger.log(`Creating a review for perfume: ${paramInput.perfumeId}`, 'ReviewController.createReview')
      await this.reviewService.createReview(paramInput.perfumeId, input, user.id)
      Logger.log(`Successfully created review for perfume: ${paramInput.perfumeId}`, 'ReviewController.createReview')
      return res.status(200).json({ message: 'Successfully created the review' })
    } catch (error) {
      Logger.error(
        `Failed to create review for perfume: ${paramInput.perfumeId}`,
        error.stack,
        'ReviewController.createReview'
      )
      throw new InternalServerErrorException('Failed to create the review')
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles('customer', 'product-manager', 'sales-manager')
  @ApiOperation({
    summary: 'Delete a review, for customers',
    description: 'Delete a review by its unique identifier'
  })
  @ApiOkResponse({
    description: 'Successfully deleted the review',
    type: MessageResponse
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException
  })
  async deleteReview(
    @Res() res: Response,
    @Param() input: ObjectIdDto,
    @User() user: AuthTokenPayload
  ): Promise<Response<MessageResponse>> {
    try {
      Logger.log(`Deleting review: ${input.id}`, 'ReviewController.deleteReview')
      await this.reviewService.deleteReview(input.id, user.id)
      Logger.log(`Successfully deleted review: ${input.id}`, 'ReviewController.deleteReview')
      return res.status(200).json({ message: 'Successfully deleted the review' })
    } catch (error) {
      Logger.error(`Failed to delete review: ${input.id}`, error.stack, 'ReviewController.deleteReview')
      throw new InternalServerErrorException('Failed to delete the review')
    }
  }

  @Patch(':id/approve')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('product-manager')
  @ApiOperation({
    summary: 'Approve a review, for perfume managers',
    description: 'Approve a review by its unique identifier'
  })
  @ApiOkResponse({
    description: 'Successfully approved the review',
    type: MessageResponse
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException
  })
  async approveReview(@Res() res: Response, @Param() input: ObjectIdDto): Promise<Response<MessageResponse>> {
    try {
      Logger.log(`Approving review: ${input.id}`, 'ReviewController.approveReview')
      await this.reviewService.approveReview(input.id)
      Logger.log(`Successfully approved review: ${input.id}`, 'ReviewController.approveReview')
      return res.status(200).json({ message: 'Successfully approved the review' })
    } catch (error) {
      Logger.error(`Failed to approve review: ${input.id}`, error.stack, 'ReviewController.approveReview')
      throw new InternalServerErrorException('Failed to approve the review')
    }
  }

  @Patch(':id/reject')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('product-manager')
  @ApiOperation({
    summary: 'Reject a review, for perfume managers',
    description: 'Reject a review by its unique identifier'
  })
  @ApiOkResponse({
    description: 'Successfully rejected the review',
    type: MessageResponse
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException
  })
  async rejectReview(@Res() res: Response, @Param() input: ObjectIdDto): Promise<Response<MessageResponse>> {
    try {
      Logger.log(`Rejecting review: ${input.id}`, 'ReviewController.rejectReview')
      await this.reviewService.rejectReview(input.id)
      Logger.log(`Successfully rejected review: ${input.id}`, 'ReviewController.rejectReview')
      return res.status(200).json({ message: 'Successfully rejectd the review' })
    } catch (error) {
      Logger.error(`Failed to reject review: ${input.id}`, error.stack, 'ReviewController.rejectReview')
      throw new InternalServerErrorException('Failed to reject the review')
    }
  }
}
