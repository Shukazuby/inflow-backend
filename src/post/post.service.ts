import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'nestjs-prisma';
import { FeedQueryDto, SortBy } from './dto/feed-query.dto';
import { PaginatedFeedResponse } from './interfaces/feed-response.interface';

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

      let minted = false;
      if (mint) {
        minted = mint;
      }

      const post = await this.prisma.post.create({
        data: {
          userId,
          content,
          media,
          tags,
          category,
          visibility,
          isMinted: minted,
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

  findOne(id: string) {
    return `This action returns a #${id} post`;
  }

  async update(id: string, updatePostDto: UpdatePostDto, userId: string) {
    const { content, media, tags, category, visibility, mint } = updatePostDto;

    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException(`Post not found`);
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    // If validation passes, update the post
    return this.prisma.post.update({
      where: { id },
      data: {
        content,
        media,
        tags,
        category,
        visibility,
        isMinted: mint,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    try {
      // First, check if the post exists
      const post = await this.prisma.post.findUnique({
        where: { id },
      });

      if (!post) {
        throw new NotFoundException(`Post not found`);
      }

      if (post.isMinted) {
        // If it's an NFT, we need to burn it on-chain before deletion
        try {
          // TODO: Implement the on-chain burn operation
          // This would connect to your blockchain service or utility
          this.logger.log(
            `NFT post ${id} burn operation would be triggered here`,
          );
          await this.prisma.post.delete({
            where: { id },
          });

          return {
            message: `NFT post burned and deleted`,
          };
        } catch (burnError) {
          this.logger.error(`Failed to burn NFT post:`, burnError.stack);
          throw new Error(`NFT burn operation failed: ${burnError.message}`);
        }
      } else {
        await this.prisma.post.delete({
          where: { id },
        });

        return {
          message: `Post deleted`,
        };
      }
    } catch (error) {
      this.logger.error(`Post deletion failed:`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Post deletion failed: ${error.message}`);
    }
  }
  async getFeed(query: FeedQueryDto): Promise<PaginatedFeedResponse> {
    try {
      const { page = 1, limit = 10, sortBy = SortBy.RECENCY } = query;
      const skip = (page - 1) * limit;

      // Define sorting based on the sortBy parameter
      let orderBy: any = {};      if (sortBy === SortBy.RECENCY) {
        orderBy = { createdAt: 'desc' };      } else if (sortBy === SortBy.POPULARITY) {
        // For popularity, we sort by the number of tips
        // With a secondary sort by recency
        orderBy = [
          { tips: { _count: 'desc' } },
          { createdAt: 'desc' },
        ];
      }

      // Get posts with pagination
      const [posts, totalCount] = await Promise.all([
        this.prisma.post.findMany({
          where: {
            visibility: 'public',
          },
          orderBy,
          skip,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },            _count: {
              select: {
                tips: true,
              },
            },
          },
        }),
        this.prisma.post.count({
          where: {
            visibility: 'public',
          },
        }),
      ]);

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        data: posts,
        meta: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems: totalCount,
          totalPages,
          hasNextPage,
          hasPreviousPage,
        },
      };
    } catch (error) {
      this.logger.error('Feed retrieval failed:', error.stack);
      throw new Error(`Failed to retrieve feed: ${error.message}`);
    }
  }
}
