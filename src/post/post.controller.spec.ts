import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { JwtAuthGuard } from 'src/guards/jwt.strategy';
import { CreatePostDto, Visibility } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { NotFoundException } from '@nestjs/common';
import { SortBy } from './dto/feed-query.dto';

describe('PostController', () => {
  let controller: PostController;
  let service: PostService;

  const mockPostService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getFeed: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [
        {
          provide: PostService,
          useValue: mockPostService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PostController>(PostController);
    service = module.get<PostService>(PostService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new post', async () => {
      // Arrange
      const userId = 'user1';
      const req = { user: { id: userId } };
      const createPostDto: CreatePostDto = {
        content: 'Test content',
        media: 'media.jpg',
        tags: ['test', 'content'],
        category: 'GENERAL',
        visibility: Visibility.PUBLIC,
        mint: false,
      };
      const expectedResult = {
        message: 'Post created',
        post: {
          id: 'post1',
          ...createPostDto,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };      mockPostService.create.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.create(req as any, createPostDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(userId, createPostDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all posts', () => {
      // Arrange
      const expectedResult = 'This action returns all post';      mockPostService.findAll.mockReturnValue(expectedResult);

      // Act
      const result = controller.findAll();

      // Assert
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a single post', async () => {
      // Arrange
      const postId = 'post1';
      const mockPost = {
        id: postId,
        content: 'Test content',
        media: 'image.jpg',
        tags: ['test'],
        category: 'general',
        visibility: 'public',
        isMinted: false,        nftMetadata: null
      };
      mockPostService.findOne.mockResolvedValue(mockPost);

      // Act
      const result = await controller.findOne(postId);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(postId);
      expect(result).toEqual(mockPost);
    });

    it('should return a post with NFT metadata when post is minted', async () => {
      // Arrange
      const postId = 'minted-post-id';
      const mockPost = {
        id: postId,
        content: 'Minted post content',
        media: 'nft-image.jpg',
        tags: ['nft', 'crypto'],
        category: 'art',
        visibility: 'public',
        isMinted: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 'user-id',
          username: 'nftcreator',
          avatarUrl: 'avatar.jpg',
        },
        _count: {
          tips: 15
        },
        nftMetadata: {
          tokenId: 'token-123',
          contractAddress: '0x1234abcd',
          chain: 'ethereum',
          mintedAt: new Date(),
          owner: '0xowner'
        }
      };      
      mockPostService.findOne.mockResolvedValue(mockPost);
      
      // Act
      const result = await controller.findOne(postId);
      
      // Assert
      expect(service.findOne).toHaveBeenCalledWith(postId);
      expect(result).toEqual(mockPost);
      expect(result.nftMetadata).toBeDefined();
    });
    
    it('should return a post without NFT metadata when post is not minted', async () => {
      // Arrange
      const postId = 'regular-post-id';
      const mockPost = {
        id: postId,
        content: 'Regular post content',
        media: 'image.jpg',
        tags: ['tech'],
        category: 'general',
        visibility: 'public',
        isMinted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 'user-id',
          username: 'regular_user',
          avatarUrl: null,
        },
        _count: {
          tips: 5
        },
        nftMetadata: null
      };      
      mockPostService.findOne.mockResolvedValue(mockPost);
      
      // Act
      const result = await controller.findOne(postId);
      
      // Assert
      expect(service.findOne).toHaveBeenCalledWith(postId);
      expect(result).toEqual(mockPost);
      expect(result.nftMetadata).toBeNull();
    });
    
  it('should throw NotFoundException when post does not exist', async () => {
      // Arrange
      const postId = 'non-existent-id';
      mockPostService.findOne.mockRejectedValue(new NotFoundException(`Post with ID ${postId} not found`));
        // Act & Assert
      await expect(controller.findOne(postId)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(postId);
    });
  });

  describe('update', () => {
    it('should update a post', () => {
      // Arrange
      const userId = 'user1';
      const postId = 'post1';
      const updatePostDto: UpdatePostDto = {
        content: 'Updated content',
      };      const req = { user: { id: userId } };
      const expectedResult = `This action updates a #${postId} post`;
      mockPostService.update.mockReturnValue(expectedResult);

      // Act
      const result = controller.update(postId, updatePostDto, req);

      // Assert
      expect(service.update).toHaveBeenCalledWith(postId, updatePostDto, userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should delete a post', async () => {
      // Arrange
      const userId = 'user1';
      const postId = 'post1';
      const req = { user: { id: userId } };      const expectedResult = {
        message: `Post with ID ${postId} has been successfully deleted`,
      };
      mockPostService.remove.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.remove(req as any, postId);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(postId);
      expect(result).toEqual(expectedResult);
    });

    it('should delete an NFT post with burn operation', async () => {
      // Arrange
      const userId = 'user1';
      const postId = 'nft-post1';
      const req = { user: { id: userId } };      const expectedResult = {
        message: `NFT post with ID ${postId} has been successfully burned and deleted`,
      };
      mockPostService.remove.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.remove(req as any, postId);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(postId);
      expect(result).toEqual(expectedResult);
    });

     describe('getFeed', () => {
    it('should call service.getFeed with the provided query parameters', async () => {
      // Arrange
      const query = { page: 2, limit: 15, sortBy: SortBy.POPULARITY };
      const expectedResult = {
        data: [],
        meta: {
          currentPage: 2,
          itemsPerPage: 15,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };      mockPostService.getFeed.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.getFeed(query);

      // Assert
      expect(service.getFeed).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });
  });

    it('should use default values when no query parameters are provided', async () => {
      // Arrange
      const expectedResult = {
        data: [],
        meta: {
          currentPage: 1,
          itemsPerPage: 10,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };      mockPostService.getFeed.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.getFeed({});

      // Assert
      expect(service.getFeed).toHaveBeenCalledWith({});
      expect(result).toEqual(expectedResult);
    });
  });
});