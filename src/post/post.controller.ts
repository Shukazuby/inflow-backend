import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Query,
  NotFoundException
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { FeedQueryDto } from './dto/feed-query.dto';
import { Request as ExpressRequest } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt.strategy';
import { FeedResponseSchema } from './schema/feed-response.schema';
import { PostDetailSchema } from './schema/post-detail.schema';
import { CommentResponseSchema } from './schema/comment-response.schema';

@ApiTags('Post')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @ApiBearerAuth('jwt-auth')
  @UseGuards(JwtAuthGuard)
  async create(@Request() req: ExpressRequest, @Body() dto: CreatePostDto) {
    const result = await this.postService.create(req['user'].id, dto);
    return result;
  }

  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @Get('posts')
  @ApiOperation({ summary: 'Get a paginated feed of public posts' })  
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns paginated public posts',
    schema: FeedResponseSchema,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid query parameters',
  })
  async getFeed(@Query() query: FeedQueryDto) {
    return this.postService.getFeed(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed information about a specific post' })
  @ApiParam({ name: 'id', description: 'Post ID', type: 'string' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns detailed post information including NFT metadata if minted',
    schema: PostDetailSchema,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Post not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid post ID',
  })
  async findOne(@Param('id') id: string) {
    try {
      const post = await this.postService.findOne(id);
      return post;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth('jwt-auth')
  @ApiOperation({ summary: 'Update a post' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Post has been successfully updated.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'You can only edit your own posts.',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Post not found.' })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  update(
    @Param('id') id: string, // Changed from ParseIntPipe to string
    @Body() updatePostDto: UpdatePostDto,
    @Request() req,
  ) {
    return this.postService.update(id, updatePostDto, req.user.id);
  }

  @ApiBearerAuth('jwt-auth')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a post' })
  @ApiResponse({
    status: 200,
    description: 'Post deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User not authorized to delete this post',
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found',
  })
  async remove(
    @Request() req: ExpressRequest,
    @Param('id') id: string,
  ) {
    return this.postService.remove(id);
  }

  @Post(':id/comments')
  @ApiBearerAuth('jwt-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add a comment to a post' })
  @ApiParam({ name: 'id', description: 'Post ID', type: 'string' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Comment created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Comment created successfully' },
        comment: CommentResponseSchema,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Post not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid comment content or spam detected',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  async createComment(
    @Param('id') postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: ExpressRequest,
  ) {
    return this.postService.createComment(req['user'].id, postId, createCommentDto);
  }
}