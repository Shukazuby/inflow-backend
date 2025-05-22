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
  Query
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FeedQueryDto } from './dto/feed-query.dto';
import { Request as ExpressRequest } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt.strategy';
import { FeedResponseSchema } from './schema/feed-response.schema';

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

  @Get('feed')
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
  findOne(@Param('id') id: string) {
    return this.postService.findOne(id);
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
}