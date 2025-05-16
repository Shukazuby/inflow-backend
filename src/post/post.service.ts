import { Injectable, Logger } from '@nestjs/common';
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

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
