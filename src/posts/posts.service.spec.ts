import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { FeedQueryDto, SortBy } from './dto/feed-query.dto';
import { PrismaService } from 'nestjs-prisma';

describe('PostsService', () => {
  let service: PostsService;

  const mockPrismaService = {
    post: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostsService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<PostsService>(PostsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFeed', () => {
    it('should return paginated posts sorted by recency', async () => {
      const mockPosts = [
        { 
          id: 'post1', 
          content: 'Post 1',
          media: 'image.jpg',
          tags: ['tag1', 'tag2'],
          category: 'tech',
          visibility: 'public',
          isMinted: false,
          createdAt: new Date('2023-07-01'),
          updatedAt: new Date('2023-07-01'),
          userId: 'user1',
          user: {
            id: 'user1',
            username: 'testuser1',
            avatarUrl: 'avatar1.jpg',
          },
          _count: {
            tips: 5
          }
        },
        { 
          id: 'post2', 
          content: 'Post 2',
          media: null,
          tags: ['tag3'],
          category: 'art',
          visibility: 'public',
          isMinted: true,
          createdAt: new Date('2023-07-02'),
          updatedAt: new Date('2023-07-02'),
          userId: 'user2',
          user: {
            id: 'user2',
            username: 'testuser2',
            avatarUrl: null,
          },
          _count: {
            tips: 10
          }
        },
      ];
      const totalCount = 2;

      mockPrismaService.post.findMany.mockResolvedValue(mockPosts);
      mockPrismaService.post.count.mockResolvedValue(totalCount);
      
      const query: FeedQueryDto = {};
      const result = await service.getFeed(query);

      expect(mockPrismaService.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { visibility: 'public' },
          orderBy: { createdAt: 'desc' },
          skip: 0,
          take: 10,
          include: expect.objectContaining({
            user: expect.objectContaining({
              select: expect.objectContaining({
                id: true,
                username: true,
                avatarUrl: true
              })
            }),
            _count: expect.objectContaining({
              select: expect.objectContaining({
                tips: true
              })
            })
          })
        }),
      );

      expect(result).toEqual({
        data: mockPosts,
        meta: {
          currentPage: 1,
          itemsPerPage: 10,
          totalItems: totalCount,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    });
    
    it('should sort by popularity when specified', async () => {
      const mockPopularPosts = [
        {
          id: 'post2',
          content: 'Popular post',
          tags: ['popular'],
          category: 'tech',
          visibility: 'public',
          isMinted: false,
          createdAt: new Date('2023-07-01'),
          updatedAt: new Date('2023-07-01'),
          user: {
            id: 'user2',
            username: 'testuser2',
            avatarUrl: 'avatar2.jpg',
          },
          _count: {
            tips: 20
          }
        },
        {
          id: 'post1',
          content: 'Less popular post',
          tags: ['unpopular'],
          category: 'tech',
          visibility: 'public',
          isMinted: false,
          createdAt: new Date('2023-07-02'),
          updatedAt: new Date('2023-07-02'),
          user: {
            id: 'user1',
            username: 'testuser1',
            avatarUrl: 'avatar1.jpg',
          },
          _count: {
            tips: 5
          }
        }
      ];
      
      mockPrismaService.post.findMany.mockResolvedValue(mockPopularPosts);
      mockPrismaService.post.count.mockResolvedValue(2);

      const result = await service.getFeed({ sortBy: SortBy.POPULARITY });

      expect(mockPrismaService.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: expect.arrayContaining([
            expect.objectContaining({ tips: { _count: 'desc' } }),
            expect.objectContaining({ createdAt: 'desc' })
          ]),
        }),
      );      
      // Verify the posts are ordered correctly
      expect(result.data[0]._count.tips).toBe(20);
      expect(result.data[1]._count.tips).toBe(5);
    });

    it('should handle pagination correctly', async () => {
      const mockPaginatedPosts = [
        { 
          id: 'post3', 
          content: 'Post from page 2',
          visibility: 'public',
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 'user3',
            username: 'testuser3',
            avatarUrl: 'avatar3.jpg',
          },
          _count: {
            tips: 2
          }
        }
      ];
      
      mockPrismaService.post.findMany.mockResolvedValue(mockPaginatedPosts);
      mockPrismaService.post.count.mockResolvedValue(30);

      const result = await service.getFeed({ page: 2, limit: 10 });

      expect(mockPrismaService.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
          where: { visibility: 'public' },
        }),
      );

      expect(result.data).toEqual(mockPaginatedPosts);
      expect(result.meta).toEqual({
        currentPage: 2,
        itemsPerPage: 10,
        totalItems: 30,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      });
    });

    it('should handle custom page size limits', async () => {
      const mockPosts = Array(20).fill(null).map((_, index) => ({
        id: `post${index}`,
        content: `Post ${index}`,
        visibility: 'public',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: `user${index}`,
          username: `user${index}`,
          avatarUrl: null,
        },
        _count: {
          tips: index
        }
      }));
      
      mockPrismaService.post.findMany.mockResolvedValue(mockPosts);
      mockPrismaService.post.count.mockResolvedValue(100);

      const result = await service.getFeed({ page: 1, limit: 20 });

      expect(mockPrismaService.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
        }),
      );

      expect(result.data.length).toBe(20);
      expect(result.meta).toEqual({
        currentPage: 1,
        itemsPerPage: 20,
        totalItems: 100,
        totalPages: 5,
        hasNextPage: true,
        hasPreviousPage: false,
      });
    });

    it('should handle errors during feed retrieval', async () => {
      const errorMessage = 'Database connection error';
      mockPrismaService.post.findMany.mockRejectedValue(new Error(errorMessage));

      await expect(service.getFeed({})).rejects.toThrow(`Failed to retrieve feed: ${errorMessage}`);
      
    });
  });
});
