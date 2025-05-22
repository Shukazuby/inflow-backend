import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { PrismaService } from 'nestjs-prisma';
import { NotFoundException } from '@nestjs/common';
import { Visibility } from './dto/create-post.dto';
import { SortBy } from './dto/feed-query.dto';

describe('PostService', () => {
  let service: PostService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    post: {
      findUnique: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new post', async () => {
      // Arrange
      const userId = 'user1';
      const createPostDto = {
        content: 'Test content',
        media: 'media.jpg',
        tags: ['test', 'content'],
        category: 'GENERAL',
        visibility: Visibility.PUBLIC,
        mint: false,
      };

      const mockCreatedPost = {
        id: 'post1',
        userId,
        content: createPostDto.content,
        media: createPostDto.media,
        tags: createPostDto.tags,
        category: createPostDto.category,
        visibility: createPostDto.visibility,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.post.create.mockResolvedValue(mockCreatedPost);

      // Act
      const result = await service.create(userId, createPostDto);      // Assert
      expect(mockPrismaService.post.create).toHaveBeenCalledWith({
        data: {
          userId,
          content: createPostDto.content,
          media: createPostDto.media,
          tags: createPostDto.tags,
          category: createPostDto.category,
          visibility: createPostDto.visibility,
          isMinted: false,
        },
      });
      expect(result).toEqual({
        message: 'Post created',
        post: mockCreatedPost,
      });
    });

    it('should throw an error if visibility is invalid', async () => {
      // Arrange
      const userId = 'user1';
      const createPostDto = {
        content: 'Test content',
        media: 'media.jpg',
        tags: ['test', 'content'],
        category: 'GENERAL',
        visibility: 'invalid_visibility' as Visibility, // Invalid visibility
        mint: false,
      };

      // Act & Assert
      await expect(service.create(userId, createPostDto)).rejects.toThrow(
        'Post creation failed: Invalid visibility value: invalid_visibility',
      );
      expect(mockPrismaService.post.create).not.toHaveBeenCalled();
    });
  });
  describe('remove', () => {
    it('should delete a non-NFT post', async () => {
      // Arrange
      const postId = 'post1';
      const mockPost = {
        id: postId,
        userId: 'user1',
        content: 'Test content',
        isMinted: false,
      };

      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
      mockPrismaService.post.delete.mockResolvedValue(mockPost);

      // Act
      const result = await service.remove(postId);

      // Assert
      expect(mockPrismaService.post.findUnique).toHaveBeenCalledWith({
        where: { id: postId },
      });
      expect(mockPrismaService.post.delete).toHaveBeenCalledWith({
        where: { id: postId },
      });      expect(result).toEqual({
        message: `Post deleted`,
      });
    });    it('should burn and delete an NFT post', async () => {
      // Arrange
      const postId = 'nft-post1';
      const mockNftPost = {
        id: postId,
        userId: 'user1',
        content: 'NFT content',
        isMinted: true, // Indicating it's an NFT
      };

      mockPrismaService.post.findUnique.mockResolvedValue(mockNftPost);
      mockPrismaService.post.delete.mockResolvedValue(mockNftPost);      // Act
      const result = await service.remove(postId);

      // Assert
      expect(mockPrismaService.post.findUnique).toHaveBeenCalledWith({
        where: { id: postId },
      });
      expect(mockPrismaService.post.delete).toHaveBeenCalledWith({
        where: { id: postId },
      });
      expect(result).toEqual({
        message: `NFT post burned and deleted`,
      });
    });

    it('should throw NotFoundException when post does not exist', async () => {
      // Arrange
      const nonExistentPostId = 'non-existent';
      mockPrismaService.post.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(nonExistentPostId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.post.findUnique).toHaveBeenCalledWith({
        where: { id: nonExistentPostId },
      });
      expect(mockPrismaService.post.delete).not.toHaveBeenCalled();
    });    it('should handle errors when deleting posts', async () => {
      // Arrange
      const postId = 'post1';
      mockPrismaService.post.findUnique.mockResolvedValue({
        id: postId,
        isMinted: false,
      });
      
      // Force an error during delete
      const deleteError = new Error('Database error');
      mockPrismaService.post.delete.mockRejectedValue(deleteError);      // Act & Assert
      await expect(service.remove(postId)).rejects.toThrow(
        /Post deletion failed/,
      );
    });
  });

  describe('getFeed', () => {
    it('should return paginated posts sorted by recency', async () => {
      const mockPosts = [
        { 
          id: 'post1', 
          content: 'Post 1', 
          userId: 'user1', 
          createdAt: new Date(),
          visibility: 'public'
        },
        { 
          id: 'post2', 
          content: 'Post 2', 
          userId: 'user2',
          createdAt: new Date(),
          visibility: 'public'
        },
      ];
      const totalCount = 2;

      mockPrismaService.post.findMany.mockResolvedValue(mockPosts);
      mockPrismaService.post.count.mockResolvedValue(totalCount);
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
          totalItems: totalCount,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    });    it('should sort by popularity when specified', async () => {
      mockPrismaService.post.findMany.mockResolvedValue([]);
      mockPrismaService.post.count.mockResolvedValue(0);

      await service.getFeed({ sortBy: SortBy.POPULARITY });

      expect(mockPrismaService.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: expect.arrayContaining([
            expect.objectContaining({ tips: expect.anything() })
          ]),
        }),
      );
    });

    it('should handle pagination correctly', async () => {
      mockPrismaService.post.findMany.mockResolvedValue([]);
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
      const errorMessage = 'Database connection error';
      mockPrismaService.post.findMany.mockRejectedValue(new Error(errorMessage));

      await expect(service.getFeed({})).rejects.toThrow(`Failed to retrieve feed: ${errorMessage}`);
    });
  });
});