import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PostService } from '../../post/post.service';
import { PostShareActivity } from './entities/post-share-activity.entity';
import { PostShareService } from './post-share.service';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('PostShareService', () => {
  let service: PostShareService;
  let shareRepository: Repository<PostShareActivity>;
  let postService: PostService;

  const mockShareRepository = {
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
  };

  const mockPostService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostShareService,
        {
          provide: getRepositoryToken(PostShareActivity),
          useValue: mockShareRepository,
        },
        {
          provide: PostService,
          useValue: mockPostService,
        },
      ],
    }).compile();

    service = module.get<PostShareService>(PostShareService);
    shareRepository = module.get<Repository<PostShareActivity>>(
      getRepositoryToken(PostShareActivity),
    );
    postService = module.get<PostService>(PostService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createShare', () => {
    it('should successfully create a share activity', async () => {
      const postId = 'post-id';
      const userId = 'user-id';
      const ipAddress = '127.0.0.1';
      const userAgent = 'jest';
      const createShareDto = { source: 'twitter' as any };

      const shareActivity = { id: 'share-id', postId, userId };

      mockPostService.findOne.mockResolvedValue({ id: postId });
      mockShareRepository.create.mockReturnValue(shareActivity);
      mockShareRepository.save.mockResolvedValue(shareActivity);
      mockShareRepository.count.mockResolvedValue(1);

      const result = await service.createShare(
        postId,
        createShareDto,
        ipAddress,
        userAgent,
        userId,
      );

      expect(result.success).toBe(true);
      expect(result.data.shareId).toBe('share-id');
      expect(result.data.shareCount).toBe(1);
      expect(postService.findOne).toHaveBeenCalledWith(postId);
      expect(shareRepository.save).toHaveBeenCalledWith(shareActivity);
    });

    it('should throw NotFoundException if post does not exist', async () => {
      const postId = 'non-existent-post-id';
      mockPostService.findOne.mockRejectedValue(new NotFoundException());

      await expect(
        service.createShare(postId, {}, '127.0.0.1', 'jest'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
