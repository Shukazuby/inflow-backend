import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CommentsService } from '../comments.service';
import { Comment } from '../entities/comment.entity';
import { Post } from '../../posts/entities/post.entity';
import { CommentOrderType } from '../dto/get-comments-query.dto';

describe('CommentsService', () => {
  let service: CommentsService;
  let commentRepository: Repository<Comment>;
  let postRepository: Repository<Post>;

  const mockCommentRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    count: jest.fn(),
  };

  const mockPostRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(Comment),
          useValue: mockCommentRepository,
        },
        {
          provide: getRepositoryToken(Post),
          useValue: mockPostRepository,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    commentRepository = module.get<Repository<Comment>>(getRepositoryToken(Comment));
    postRepository = module.get<Repository<Post>>(getRepositoryToken(Post));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCommentsByPostId', () => {
    const mockPost = { id: 1, title: 'Test Post', content: 'Test content' };
    const mockComments = [
      {
        id: 1,
        content: 'First comment',
        postId: 1,
        authorId: 1,
        parentId: null,
        createdAt: new Date('2024-01-01'),
        author: { id: 1, username: 'user1' },
      },
      {
        id: 2,
        content: 'Second comment',
        postId: 1,
        authorId: 2,
        parentId: null,
        createdAt: new Date('2024-01-02'),
        author: { id: 2, username: 'user2' },
      },
    ];

    it('should throw NotFoundException when post does not exist', async () => {
      mockPostRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getCommentsByPostId(999, { order: CommentOrderType.CHRONOLOGICAL }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return chronological comments with pagination info', async () => {
      mockPostRepository.findOne.mockResolvedValue(mockPost);
      mockCommentRepository.count.mockResolvedValue(2);
      mockCommentRepository.findAndCount.mockResolvedValue([mockComments, 2]);
      
        mockCommentRepository.count
        .mockResolvedValueOnce(2) 
        .mockResolvedValueOnce(0) 
        .mockResolvedValueOnce(1); 

      const result = await service.getCommentsByPostId(1, {
        order: CommentOrderType.CHRONOLOGICAL,
        limit: 50,
        offset: 0,
      });

      expect(result.comments).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.hasMore).toBe(false);
      expect(result.order).toBe(CommentOrderType.CHRONOLOGICAL);
    });

    it('should return nested comments structure', async () => {
      const nestedComments = [
        {
          id: 1,
          content: 'Root comment',
          postId: 1,
          authorId: 1,
          parentId: null,
          createdAt: new Date('2024-01-01'),
          author: { id: 1, username: 'user1' },
        },
      ];

      const childComments = [
        {
          id: 2,
          content: 'Child comment',
          postId: 1,
          authorId: 2,
          parentId: 1,
          createdAt: new Date('2024-01-02'),
          author: { id: 2, username: 'user2' },
        },
      ];

      mockPostRepository.findOne.mockResolvedValue(mockPost);
      mockCommentRepository.count.mockResolvedValue(2);
      mockCommentRepository.find
        .mockResolvedValueOnce(nestedComments) 
        .mockResolvedValueOnce(childComments) 
        .mockResolvedValue([]);

      const result = await service.getCommentsByPostId(1, {
        order: CommentOrderType.NESTED,
        maxDepth: 3,
        limit: 50,
        offset: 0,
      });

      expect(result.comments).toHaveLength(1);
      expect(result.comments[0].children).toHaveLength(1);
      expect(result.order).toBe(CommentOrderType.NESTED);
    });
  });

  describe('getCommentById', () => {
    it('should return comment when found', async () => {
      const mockComment = {
        id: 1,
        content: 'Test comment',
        author: { id: 1, username: 'user1' },
        post: { id: 1, title: 'Test Post' },
      };

      mockCommentRepository.findOne.mockResolvedValue(mockComment);

      const result = await service.getCommentById(1);

      expect(result).toEqual(mockComment);
      expect(mockCommentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, isActive: true },
        relations: ['author', 'post'],
      });
    });

    it('should throw NotFoundException when comment not found', async () => {
      mockCommentRepository.findOne.mockResolvedValue(null);

      await expect(service.getCommentById(999)).rejects.toThrow(NotFoundException);
    });
  });
});
