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
  HttpStatus,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../guards/jwt.strategy'; // Fixed path to guard
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Post has been successfully created.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  create(@Body() createPostDto: CreatePostDto, @Request() req) {
    return this.postService.create(createPostDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return all posts.' })
  findAll() {
    return this.postService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a post by ID' })
  @ApiParam({ name: 'id', description: 'Post ID', example: 'abc123' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return the post.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Post not found.' })
  findOne(@Param('id') id: string) {
    // Changed from ParseIntPipe to string
    return this.postService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a post' })
  @ApiParam({ name: 'id', description: 'Post ID', example: 'abc123' })
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

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a post' })
  @ApiParam({ name: 'id', description: 'Post ID', example: 'abc123' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Post has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'You can only delete your own posts.',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Post not found.' })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  remove(@Param('id') id: string, @Request() req) {
    // Changed from ParseIntPipe to string
    return this.postService.remove(id, req.user.id);
  }
}
