import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  HttpException,
  HttpStatus,
  UseInterceptors,
  CacheInterceptor,
  CacheTTL,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { GetCommentsQueryDto } from './dto/get-comments-query.dto';
import { CommentsListResponseDto } from './dto/comments-list-response.dto';
import { CommentResponseDto } from './dto/comment-response.dto';

@ApiTags('Comments')
@Controller('post')
@UseInterceptors(CacheInterceptor)
export class CommentsController {
  private readonly logger = new Logger(CommentsController.name);

  constructor(private readonly commentsService: CommentsService) {}

  @Get(':id/comments')
  @CacheTTL(300) 
  @ApiOperation({
    summary: 'Get comments for a post',
    description: 'Retrieve all comments associated with a specific post in chronological or nested order',
  })
  @ApiParam({
    name: 'id',
    description: 'Post ID',
    type: 'number',
    example: 1,
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['chronological', 'nested'],
    description: 'Ordering type for comments',
    example: 'chronological',
  })
  @ApiQuery({
    name: 'maxDepth',
    required: false,
    type: 'number',
    description: 'Maximum depth for nested comments (only for nested order)',
    example: 3,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: 'Number of comments per page',
    example: 50,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: 'number',
    description: 'Offset for pagination',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Comments retrieved successfully',
    type: CommentsListResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Post with ID 999 not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters',
    schema: {
      example: {
        statusCode: 400,
        message: ['Order must be either "chronological" or "nested"'],
        error: 'Bad Request',
      },
    },
  })
  async getPostComments(
    @Param('id', ParseIntPipe) postId: number,
    @Query() queryDto: GetCommentsQueryDto,
  ): Promise<CommentsListResponseDto> {
    try {
      this.logger.log(`Getting comments for post ${postId}`);
      
      const result = await this.commentsService.getCommentsByPostId(
        postId,
        queryDto,
      );

      this.logger.log(
        `Retrieved ${result.comments.length} comments for post ${postId} in ${queryDto.order} order`
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Error getting comments for post ${postId}: ${error.message}`,
        error.stack,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Internal server error while retrieving comments',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('comments/:commentId')
  @CacheTTL(600) 
  @ApiOperation({
    summary: 'Get a specific comment',
    description: 'Retrieve a specific comment by its ID',
  })
  @ApiParam({
    name: 'commentId',
    description: 'Comment ID',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Comment retrieved successfully',
    type: CommentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Comment not found',
  })
  async getComment(
    @Param('commentId', ParseIntPipe) commentId: number,
  ): Promise<CommentResponseDto> {
    try {
      const comment = await this.commentsService.getCommentById(commentId);
      return comment as CommentResponseDto;
    } catch (error) {
      this.logger.error(
        `Error getting comment ${commentId}: ${error.message}`,
        error.stack,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Internal server error while retrieving comment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}