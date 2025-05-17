import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { JwtAuthGuard } from 'src/guards/jwt.strategy';
import { CreatePostDto, Visibility } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { HttpStatus } from '@nestjs/common';

describe('PostController', () => {
  let controller: PostController;
  let service: PostService;

  const mockPostService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
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
      };
      mockPostService.create.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.create(req as any, createPostDto);

      // Assert
      expect(mockPostService.create).toHaveBeenCalledWith(userId, createPostDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all posts', () => {
      // Arrange
      const expectedResult = 'This action returns all post';
      mockPostService.findAll.mockReturnValue(expectedResult);

      // Act
      const result = controller.findAll();

      // Assert
      expect(mockPostService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a single post', () => {
      // Arrange
      const postId = 'post1';
      const expectedResult = `This action returns a #${postId} post`;
      mockPostService.findOne.mockReturnValue(expectedResult);

      // Act
      const result = controller.findOne(postId);

      // Assert
      expect(mockPostService.findOne).toHaveBeenCalledWith(postId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a post', () => {
      // Arrange
      const postId = 'post1';
      const updatePostDto: UpdatePostDto = {
        content: 'Updated content',
      };
      const expectedResult = `This action updates a #${postId} post`;
      mockPostService.update.mockReturnValue(expectedResult);

      // Act
      const result = controller.update(postId, updatePostDto);

      // Assert
      expect(mockPostService.update).toHaveBeenCalledWith(postId, updatePostDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should delete a post', async () => {
      // Arrange
      const userId = 'user1';
      const postId = 'post1';
      const req = { user: { id: userId } };
      const expectedResult = {
        message: `Post with ID ${postId} has been successfully deleted`,
      };
      mockPostService.remove.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.remove(req as any, postId);

      // Assert
      expect(mockPostService.remove).toHaveBeenCalledWith(postId);
      expect(result).toEqual(expectedResult);
    });

    it('should delete an NFT post with burn operation', async () => {
      // Arrange
      const userId = 'user1';
      const postId = 'nft-post1';
      const req = { user: { id: userId } };
      const expectedResult = {
        message: `NFT post with ID ${postId} has been successfully burned and deleted`,
      };
      mockPostService.remove.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.remove(req as any, postId);

      // Assert
      expect(mockPostService.remove).toHaveBeenCalledWith(postId);
      expect(result).toEqual(expectedResult);
    });
  });
});