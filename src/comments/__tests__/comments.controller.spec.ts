import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/common';
import { CommentsController } from '../comments.controller';
import { CommentsService } from '../comments.service';
import { CommentOrderType } from '../dto/get-comments-query.dto';

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: CommentsService;

  const mockCommentsService = {
    getCommentsByPostId: jest.fn(),
    getCommentById: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: mockCommentsService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    service = module.get<CommentsService>(CommentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPostComments', () => {
    it('should return comments for valid post ID', async () => {
      const mockResponse = {
        comments: [
          {
            id: 1,
            content: 'Test comment',
            postId: 1,
            author: { id: 1, username: 'user1' },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 1,
        hasMore: false,
        order: CommentOrderType.CHRONOLOGICAL,
      };

      mockCommentsService.getCommentsByPostId.mockResolvedValue(mockResponse);

      const result = await controller.getPostComments(1, {
        order: CommentOrderType.CHRONOLOGICAL,
      });

      expect(result).toEqual(mockResponse);
      expect(service.getCommentsByPostId).toHaveBeenCalledWith(1, {
        order: CommentOrderType.CHRONOLOGICAL,
      });
    });

    it('should handle service exceptions properly', async () => {
      mockCommentsService.getCommentsByPostId.mockRejectedValue(
        new Error('Post not found'),
      );

      await expect(
        controller.getPostComments(999, { order: CommentOrderType.CHRONOLOGICAL }),
      ).rejects.toThrow();
    });
  });

  describe('getComment', () => {
    it('should return specific comment', async () => {
      const mockComment = {
        id: 1,
        content: 'Test comment',
        author: { id: 1, username: 'user1' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCommentsService.getCommentById.mockResolvedValue(mockComment);

      const result = await controller.getComment(1);

      expect(result).toEqual(mockComment);
      expect(service.getCommentById).toHaveBeenCalledWith(1);
    });
  });
});