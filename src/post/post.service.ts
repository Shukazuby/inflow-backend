import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
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

  async findOne(id: string) {
    try {
      const post = await this.prisma.post.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              tips: true,
            },
          },
        },
      });

      if (!post) {
        throw new NotFoundException(`Post with ID ${id} not found`);
      }

      const response = {
        ...post,
        nftMetadata: null,
      };

      if (post.isMinted) {
        try {
          const nftMetadata = await this.fetchNftMetadata(id);
          response.nftMetadata = nftMetadata;
        } catch (error) {
          this.logger.error(`Failed to fetch NFT metadata for post ${id}:`, error.stack);
        }
      }

      return response;
    } catch (error) {
      this.logger.error(`Error fetching post ${id}:`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to fetch post: ${error.message}`);
    }
  }

private async fetchNftMetadata(postId: string) {
  try {
    const nftMetadata = await this.prisma.nftMetadata.findUnique({
      where: { postId },
    });
    
    if (!nftMetadata) {
      this.logger.warn(`No NFT metadata found for post ${postId}`);
      return null;
    }
    return nftMetadata;
  } catch (error) {
    this.logger.warn(`Error fetching NFT metadata from database: ${error.message}`);
    return null;
  }
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

      let orderBy: any = {};      if (sortBy === SortBy.RECENCY) {
        orderBy = { createdAt: 'desc' };      } else if (sortBy === SortBy.POPULARITY) {
        // For popularity, sort by the number of tips
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

  async createComment(userId: string, postId: string, createCommentDto: CreateCommentDto) {
    try {
      // Check if post exists
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        throw new NotFoundException(`Post with ID ${postId} not found`);
      }

      // Spam protection: Check for duplicate comments from the same user on the same post
      const existingComment = await this.prisma.comment.findFirst({
        where: {
          postId,
          userId,
          content: createCommentDto.content.trim(),
        },
      });

      if (existingComment) {
        throw new BadRequestException('Duplicate comment detected. Please provide unique content.');
      }

      // Spam protection: Check for recent comments from the same user on the same post (rate limiting)
      const recentComments = await this.prisma.comment.findMany({
        where: {
          postId,
          userId,
          createdAt: {
            gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
          },
        },
      });

      if (recentComments.length >= 3) {
        throw new BadRequestException('Too many comments. Please wait before posting another comment.');
      }

      // Spam protection: Check for suspicious patterns
      const suspiciousPatterns = this.detectSuspiciousPatterns(createCommentDto.content);
      if (suspiciousPatterns.length > 0) {
        throw new BadRequestException(`Comment contains suspicious patterns: ${suspiciousPatterns.join(', ')}`);
      }

      // Create the comment
      const comment = await this.prisma.comment.create({
        data: {
          content: createCommentDto.content.trim(),
          postId,
          userId,
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

      return {
        message: 'Comment created successfully',
        comment,
      };
    } catch (error) {
      this.logger.error(`Comment creation failed for post ${postId}:`, error.stack);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(`Comment creation failed: ${error.message}`);
    }
  }

  private detectSuspiciousPatterns(content: string): string[] {
    const patterns: string[] = [];
    const lowerContent = content.toLowerCase();

    // Check for excessive capitalization
    const upperCaseRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (upperCaseRatio > 0.7 && content.length > 10) {
      patterns.push('excessive capitalization');
    }

    // Check for repetitive characters
    const repetitiveChars = content.match(/(.)\1{4,}/g);
    if (repetitiveChars) {
      patterns.push('repetitive characters');
    }

    // Check for common spam words/phrases
    const spamWords = [
      'buy now', 'click here', 'free money', 'make money fast', 'earn money',
      'work from home', 'get rich quick', 'investment opportunity', 'limited time',
      'act now', 'don\'t miss out', 'exclusive offer', 'guaranteed'
    ];

    for (const word of spamWords) {
      if (lowerContent.includes(word)) {
        patterns.push('spam keywords');
        break;
      }
    }

    // Check for excessive links (basic check)
    const linkCount = (content.match(/https?:\/\/[^\s]+/g) || []).length;
    if (linkCount > 2) {
      patterns.push('excessive links');
    }

    // Check for excessive punctuation
    const punctuationRatio = (content.match(/[!?]{2,}/g) || []).length;
    if (punctuationRatio > 3) {
      patterns.push('excessive punctuation');
    }

    return patterns;
  }
}

