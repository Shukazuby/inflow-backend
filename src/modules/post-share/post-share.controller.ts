import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Ip,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { CreateShareDto } from './dto/create-share.dto';
import { ShareResponseDto } from './dto/share-response.dto';
import { PostShareService } from './post-share.service';

@ApiTags('Post Sharing')
@Controller('post')
export class PostShareController {
  constructor(private readonly postShareService: PostShareService) {}

  /**
   * Records a share for a specific post.
   */
  @Post(':id/share')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute per IP
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Share a post' })
  @ApiResponse({
    status: 200,
    description: 'Share recorded successfully.',
    type: ShareResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Post not found.' })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  @ApiTooManyRequestsResponse({ description: 'Rate limit exceeded.' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
  async sharePost(
    @Param('id') postId: string,
    @Body() createShareDto: CreateShareDto,
    @Req() req: Request,
    @Ip() ipAddress: string,
  ): Promise<ShareResponseDto> {
    const userAgent = req.headers['user-agent'];
    // Assuming user is attached to the request by an auth guard
    const userId = (req as any).user?.id;

    return this.postShareService.createShare(
      postId,
      createShareDto,
      ipAddress,
      userAgent,
      userId,
    );
  }
}
