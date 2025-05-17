import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Visibility } from '@prisma/client';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto, userId: string) {
    return this.prisma.post.create({
      data: {
        userId,
        content: createPostDto.content,
        media: createPostDto.media, // if you have media in your schema
        tags: createPostDto.tags,
        category: createPostDto.category,
        visibility: createPostDto.visibility,
      },
    });
  }

  async findAll() {
    return this.prisma.post.findMany({
      include: {
        user: {
          // Change from author to user based on schema
          select: {
            id: true,
            username: true,
            avatarUrl: true, // Changed from profilePicture to match schema
          },
        },
      },
    });
  }

  async findOne(id: string) {
    // Changed from number to string
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          // Change from author to user
          select: {
            id: true,
            username: true,
            avatarUrl: true, // Changed from profilePicture
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto, userId: string) {
    // First, check if the post exists
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Check if the current user is the author of the post
    if (post.userId !== userId) {
      // Changed from authorId to userId
      throw new ForbiddenException('You can only edit your own posts');
    }

    // If validation passes, update the post
    return this.prisma.post.update({
      where: { id },
      data: updatePostDto,
      include: {
        user: {
          // Change from author to user
          select: {
            id: true,
            username: true,
            avatarUrl: true, // Changed from profilePicture
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    // First, check if the post exists
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Check if the current user is the author of the post
    if (post.userId !== userId) {
      // Changed from authorId to userId
      throw new ForbiddenException('You can only delete your own posts');
    }

    return this.prisma.post.delete({
      where: { id },
    });
  }
}
