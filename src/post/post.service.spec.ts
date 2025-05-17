import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { PrismaService } from 'nestjs-prisma';
import { NotFoundException } from '@nestjs/common';
import { Visibility } from './dto/create-post.dto';

describe('PostService', () => {
  let service: PostService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    post: {
      findUnique: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
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
      const result = await service.create(userId, createPostDto);

      // Assert
      expect(mockPrismaService.post.create).toHaveBeenCalledWith({
        data: {
          userId,
          content: createPostDto.content,
          media: createPostDto.media,
          tags: createPostDto.tags,
          category: createPostDto.category,
          visibility: createPostDto.visibility,
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
        // No NFT indicator or with mint: false
      };

      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
      mockPrismaService.post.delete.mockResolvedValue(mockPost);

      // Override the isNFT check that's hardcoded in your service
      // For a real implementation, you would either:
      // 1. Make isNFT a class property that can be mocked
      // 2. Extract the NFT detection to a separate service that can be mocked
      // This test assumes we've modified the implementation to NOT treat all posts as NFTs
      jest.spyOn(service as any, 'isNFT').mockReturnValue(false);

      // Act
      const result = await service.remove(postId);

      // Assert
      expect(mockPrismaService.post.findUnique).toHaveBeenCalledWith({
        where: { id: postId },
      });
      expect(mockPrismaService.post.delete).toHaveBeenCalledWith({
        where: { id: postId },
      });
      expect(result).toEqual({
        message: `Post with ID ${postId} has been successfully deleted`,
      });
    });

    it('should burn and delete an NFT post', async () => {
      // Arrange
      const postId = 'nft-post1';
      const mockNftPost = {
        id: postId,
        userId: 'user1',
        content: 'NFT content',
        mint: true, // Indicating it's an NFT
      };

      mockPrismaService.post.findUnique.mockResolvedValue(mockNftPost);
      mockPrismaService.post.delete.mockResolvedValue(mockNftPost);

      // Mock the NFT detection to return true
      jest.spyOn(service as any, 'isNFT').mockReturnValue(true);
      
      // Mock the burn operation that would typically call a blockchain service
      const burnNftSpy = jest.spyOn(service as any, 'burnNft').mockResolvedValue(true);

      // Act
      const result = await service.remove(postId);

      // Assert
      expect(mockPrismaService.post.findUnique).toHaveBeenCalledWith({
        where: { id: postId },
      });
      expect(burnNftSpy).toHaveBeenCalledWith(mockNftPost);
      expect(mockPrismaService.post.delete).toHaveBeenCalledWith({
        where: { id: postId },
      });
      expect(result).toEqual({
        message: `NFT post with ID ${postId} has been successfully burned and deleted`,
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
    });

    it('should handle NFT burn operation failure', async () => {
      // Arrange
      const postId = 'nft-post1';
      const mockNftPost = {
        id: postId,
        userId: 'user1',
        content: 'NFT content',
        mint: true,
      };

      mockPrismaService.post.findUnique.mockResolvedValue(mockNftPost);
      
      // Mock the NFT detection to return true
      jest.spyOn(service as any, 'isNFT').mockReturnValue(true);
      
      // Mock the burn operation to fail
      const burnError = new Error('Blockchain connection failed');
      jest.spyOn(service as any, 'burnNft').mockRejectedValue(burnError);

      // Act & Assert
      await expect(service.remove(postId)).rejects.toThrow(
        'Post deletion failed: NFT burn operation failed: Blockchain connection failed',
      );
      expect(mockPrismaService.post.delete).not.toHaveBeenCalled();
    });
  });
});