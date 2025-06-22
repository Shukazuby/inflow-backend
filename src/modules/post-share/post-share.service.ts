import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostService } from '../../../post/post.service';
import { CreateShareDto } from './dto/create-share.dto';
import { ShareResponseDto } from './dto/share-response.dto';
import { PostShareActivity } from './entities/post-share-activity.entity';

/**
 * Service responsible for handling post share activities.
 */
@Injectable()
export class PostShareService {
  private readonly logger = new Logger(PostShareService.name);

  constructor(
    @InjectRepository(PostShareActivity)
    private readonly shareActivityRepository: Repository<PostShareActivity>,
    private readonly postService: PostService,
  ) {}

  /**
   * Records a share action for a post and returns the updated share count.
   *
   * @param postId The ID of the post being shared.
   * @param createShareDto DTO containing share details like source and referral code.
   * @param ipAddress The IP address of the user sharing the post.
   * @param userAgent The user agent of the user's device.
   * @param userId The ID of the user sharing the post (if authenticated).
   * @returns A confirmation and the updated share count.
   */
  async createShare(
    postId: string,
    createShareDto: CreateShareDto,
    ipAddress: string,
    userAgent: string,
    userId?: string,
  ): Promise<ShareResponseDto> {
    this.logger.log(`Attempting to record share for post ${postId}`);

    // 1. Validate that the post exists
    try {
      await this.postService.findOne(postId);
    } catch (error) {
      this.logger.warn(
        `Share attempt failed: Post with ID ${postId} not found.`,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Wrap other errors in a NotFoundException for consistency
      throw new NotFoundException(`Post with ID ${postId} not found.`);
    }

    // 2. Create and save the new share activity
    const newShare = this.shareActivityRepository.create({
      postId,
      userId,
      ipAddress,
      userAgent,
      ...createShareDto,
    });

    try {
      const savedShare = await this.shareActivityRepository.save(newShare);
      this.logger.log(
        `Successfully recorded share activity ${savedShare.id} for post ${postId}`,
      );

      // 3. Calculate the new share count
      const shareCount = await this.shareActivityRepository.count({
        where: { postId },
      });

      // 4. Format and return the response
      return {
        success: true,
        data: {
          postId,
          shareCount,
          shareId: savedShare.id,
          message: 'Share recorded successfully',
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to save share activity for post ${postId}: ${error.message}`,
        error.stack,
      );
      // Re-throw as a generic internal server error
      throw new Error(
        'Failed to record share activity due to a database error.',
      );
    }
  }
}
