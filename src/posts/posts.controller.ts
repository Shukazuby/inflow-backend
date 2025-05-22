import { Controller, Get, Query, HttpStatus } from '@nestjs/common';
import { PostsService } from './posts.service';
import { FeedQueryDto } from './dto/feed-query.dto';
import { FeedResponseSchema } from './schema/feed-response.schema'; 
import { ApiOperation, ApiResponse } from '@nestjs/swagger';


@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
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
    return this.postsService.getFeed(query);
  }
}
