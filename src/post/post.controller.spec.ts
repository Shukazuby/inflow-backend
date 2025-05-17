import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Visibility } from '@prisma/client';

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
    }).compile();

    controller = module.get<PostController>(PostController);
    service = module.get<PostService>(PostService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a post', async () => {
      const createPostDto: CreatePostDto = {
        content: 'Test Content',
        tags: ['test'],
        category: 'test',
        visibility: Visibility.public,
      };
      const req = { user: { id: 'user-123' } };
      const expectedResult = {
        id: 'post-123',
        content: createPostDto.content,
        userId: 'user-123',
        media: null,
        tags: createPostDto.tags,
        category: createPostDto.category,
        visibility: createPostDto.visibility,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'create').mockResolvedValue(expectedResult);

      expect(await controller.create(createPostDto, req)).toBe(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createPostDto, 'user-123');
    });
  });

  describe('findAll', () => {
    it('should return an array of posts', async () => {
      const expectedResult = [
        {
          id: 'post-123',
          content: 'Test Content',
          media: null,
          tags: ['test'],
          category: 'test',
          visibility: Visibility.public,
          userId: 'user-123',
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 'user-123',
            username: 'testuser',
            avatarUrl: 'avatar.jpg',
          },
        },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(expectedResult);

      expect(await controller.findAll()).toBe(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a post', async () => {
      const expectedResult = {
        id: 'post-123',
        content: 'Test Content',
        media: null,
        tags: ['test'],
        category: 'test',
        visibility: Visibility.public,
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 'user-123',
          username: 'testuser',
          avatarUrl: 'avatar.jpg',
        },
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(expectedResult);

      expect(await controller.findOne('post-123')).toBe(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith('post-123');
    });

    it('should throw NotFoundException when post not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('nonexistent-post')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a post when user is the owner', async () => {
      const updatePostDto: UpdatePostDto = {
        content: 'Updated Content',
        tags: ['updated'],
      };
      const req = { user: { id: 'user-123' } };
      const expectedResult = {
        id: 'post-123',
        content: 'Updated Content',
        media: null,
        tags: ['updated'],
        category: 'test',
        visibility: Visibility.public,
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 'user-123',
          username: 'testuser',
          avatarUrl: 'avatar.jpg',
        },
      };

      jest.spyOn(service, 'update').mockResolvedValue(expectedResult);

      expect(await controller.update('post-123', updatePostDto, req)).toBe(
        expectedResult,
      );
      expect(service.update).toHaveBeenCalledWith(
        'post-123',
        updatePostDto,
        'user-123',
      );
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      const updatePostDto: UpdatePostDto = {
        content: 'Updated Content',
        tags: ['updated'],
      };
      const req = { user: { id: 'user-456' } }; // Different user ID

      jest
        .spyOn(service, 'update')
        .mockRejectedValue(
          new ForbiddenException('You can only edit your own posts'),
        );

      await expect(
        controller.update('post-123', updatePostDto, req),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when post not found', async () => {
      const updatePostDto: UpdatePostDto = {
        content: 'Updated Content',
        tags: ['updated'],
      };
      const req = { user: { id: 'user-123' } };

      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException());

      await expect(
        controller.update('nonexistent-post', updatePostDto, req),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a post when user is the owner', async () => {
      const req = { user: { id: 'user-123' } };
      const expectedResult = {
        id: 'post-123',
        content: 'Test Content',
        media: null,
        tags: ['test'],
        category: 'test',
        visibility: Visibility.public,
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'remove').mockResolvedValue(expectedResult);

      expect(await controller.remove('post-123', req)).toBe(expectedResult);
      expect(service.remove).toHaveBeenCalledWith('post-123', 'user-123');
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      const req = { user: { id: 'user-456' } }; // Different user ID

      jest
        .spyOn(service, 'remove')
        .mockRejectedValue(
          new ForbiddenException('You can only delete your own posts'),
        );

      await expect(controller.remove('post-123', req)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException when post not found', async () => {
      const req = { user: { id: 'user-123' } };

      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException());

      await expect(controller.remove('nonexistent-post', req)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
