import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: string, createPostDto: CreatePostDto) {
    try {
      const { content, media, tags, category, visibility, mint } =
        createPostDto;

      const allowedVisibilities = ['public', 'private', 'followers_only'];

      if (!allowedVisibilities.includes(visibility)) {
        throw new Error(`Invalid visibility value: ${visibility}`);
      }

      const post = await this.prisma.post.create({
        data: {
          userId,
          content,
          media,
          tags,
          category,
          visibility,
        },
      });

      return {
        message: 'Post created',
        post,
      };
    } catch (error) {
      this.logger.error('Post creation failed:', error.stack);
      throw new Error(`Post creation failed: ${error.message}`);
    }
  }
  findAll() {
    return `This action returns all post`;
  }

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  async update(id: string, updatePostDto: UpdatePostDto, userId: string) {
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

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
