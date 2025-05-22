import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PrismaService } from 'nestjs-prisma';
import { SortBy } from './dto/feed-query.dto';

describe('PostsService', () => {
  let service: PostsService;
  let prismaService: PrismaService;

  const mockPosts = [
    {
      id: 'post1',
      content: 'Test content 1',
      media: 'image1.jpg',
      tags: ['test', 'first'],
      category: 'GENERAL',
      visibility: 'public',
      isMinted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: 'user1',
        username: 'testuser',
        avatarUrl: 'avatar.jpg',
      },
      _count: {
        tips: 10,
      },
    },
  ];

  const mockPrismaService = {
    post: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFeed', () => {
    it('should return paginated posts sorted by recency', async () => {
      mockPrismaService.post.findMany.mockResolvedValue(mockPosts);
      mockPrismaService.post.count.mockResolvedValue(mockPosts.length);

      const result = await service.getFeed({});

      expect(mockPrismaService.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { visibility: 'public' },
          orderBy: { createdAt: 'desc' },
          skip: 0,
          take: 10,
        }),
      );

      expect(result).toEqual({
        data: mockPosts,
        meta: {
          currentPage: 1,
          itemsPerPage: 10,
          totalItems: mockPosts.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    });

    it('should sort by popularity when specified', async () => {
      mockPrismaService.post.findMany.mockResolvedValue(mockPosts);
      mockPrismaService.post.count.mockResolvedValue(mockPosts.length);

      await service.getFeed({ sortBy: SortBy.POPULARITY });

      expect(mockPrismaService.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: expect.arrayContaining([
            { tips: { _count: 'desc' } }
          ]),
        }),
      );
    });

    it('should handle pagination correctly', async () => {
      mockPrismaService.post.findMany.mockResolvedValue(mockPosts);
      mockPrismaService.post.count.mockResolvedValue(30);

      const result = await service.getFeed({ page: 2, limit: 10 });

      expect(mockPrismaService.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );

      expect(result.meta).toEqual({
        currentPage: 2,
        itemsPerPage: 10,
        totalItems: 30,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      });
    });

    it('should handle errors during feed retrieval', async () => {
      mockPrismaService.post.findMany.mockRejectedValue(new Error('Database connection error'));

      await expect(service.getFeed({})).rejects.toThrow('Failed to retrieve feed: Database connection error');
    });
  });
});