import { Injectable, Logger } from '@nestjs/common';
import { FeedQueryDto, SortBy } from './dto/feed-query.dto';
import { PaginatedFeedResponse } from './interfaces/feed-response.interface';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class PostsService {
    private readonly logger = new Logger(PostsService.name);
    constructor(private prisma: PrismaService) {}


  async getFeed(query: FeedQueryDto): Promise<PaginatedFeedResponse> {
    try {
      const { page = 1, limit = 10, sortBy = SortBy.RECENCY } = query;
      const skip = (page - 1) * limit;

      let orderBy: any = {};      if (sortBy === SortBy.RECENCY) {
        orderBy = { createdAt: 'desc' };      } else if (sortBy === SortBy.POPULARITY) {
        orderBy = [
          { tips: { _count: 'desc' } },
          { createdAt: 'desc' },
        ];
      }

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
