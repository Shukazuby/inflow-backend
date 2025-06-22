import { Test, TestingModule } from '@nestjs/testing';
import { PostShareController } from './post-share.controller';
import { PostShareService } from './post-share.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';

describe('PostShareController', () => {
  let controller: PostShareController;
  let service: PostShareService;

  const mockPostShareService = {
    createShare: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostShareController],
      providers: [
        {
          provide: PostShareService,
          useValue: mockPostShareService,
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PostShareController>(PostShareController);
    service = module.get<PostShareService>(PostShareService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sharePost', () => {
    it('should call postShareService.createShare with correct params', async () => {
      const postId = 'post-id';
      const createShareDto = { source: 'twitter' as any };
      const req = {
        headers: { 'user-agent': 'jest' },
        user: { id: 'user-id' },
      } as any;
      const ipAddress = '127.0.0.1';
      const expectedResponse = {
        success: true,
        data: {
          postId,
          shareCount: 1,
          shareId: 'share-id',
          message: 'Share recorded successfully',
        },
      };

      mockPostShareService.createShare.mockResolvedValue(expectedResponse);

      const result = await controller.sharePost(
        postId,
        createShareDto,
        req,
        ipAddress,
      );

      expect(result).toBe(expectedResponse);
      expect(service.createShare).toHaveBeenCalledWith(
        postId,
        createShareDto,
        ipAddress,
        'jest',
        'user-id',
      );
    });
  });

  describe('Rate Limiting', () => {
    it('should have throttle metadata', () => {
      const reflector = new Reflector();
      const throttleMetadata = reflector.get(
        'throttle:options',
        controller.sharePost,
      );
      expect(throttleMetadata).toEqual({ default: { limit: 5, ttl: 60000 } });
    });
  });
});
