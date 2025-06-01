import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Post } from '../posts/entities/post.entity';
import {
  GetCommentsQueryDto,
  CommentOrderType,
} from './dto/get-comments-query.dto';
import { CommentsListResponseDto } from './dto/comments-list-response.dto';
import { plainToClass } from 'class-transformer';
import { CommentResponseDto } from './dto/comment-response.dto';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async getCommentsByPostId(
    postId: number,
    queryDto: GetCommentsQueryDto,
  ): Promise<CommentsListResponseDto> {
    this.logger.log(`Fetching comments for post ${postId} with order: ${queryDto.order}`);

    await this.validatePostExists(postId);

    const total = await this.getCommentsCount(postId);

    let comments: Comment[];
    let hasMore = false;

    if (queryDto.order === CommentOrderType.NESTED) {
      comments = await this.getNestedComments(postId, queryDto);
      hasMore = total > queryDto.offset + comments.length;
    } else {
      const result = await this.getChronologicalComments(postId, queryDto);
      comments = result.comments;
      hasMore = result.hasMore;
    }

    const commentDtos = plainToClass(CommentResponseDto, comments, {
      excludeExtraneousValues: true,
    });

    return {
      comments: commentDtos,
      total,
      hasMore,
      order: queryDto.order,
    };
  }

  private async validatePostExists(postId: number): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }
  }

  private async getCommentsCount(postId: number): Promise<number> {
    return this.commentRepository.count({
      where: {
        postId,
        isActive: true,
      },
    });
  }

  private async getChronologicalComments(
    postId: number,
    queryDto: GetCommentsQueryDto,
  ): Promise<{ comments: Comment[]; hasMore: boolean }> {
    const { limit, offset } = queryDto;

    const [comments, total] = await this.commentRepository.findAndCount({
      where: {
        postId,
        isActive: true,
      },
      relations: ['author'],
      order: {
        createdAt: 'ASC',
      },
      take: limit,
      skip: offset,
    });

    for (const comment of comments) {
      comment.replyCount = await this.commentRepository.count({
        where: {
          parentId: comment.id,
          isActive: true,
        },
      });
    }

    const hasMore = offset + comments.length < total;

    return { comments, hasMore };
  }

  private async getNestedComments(
    postId: number,
    queryDto: GetCommentsQueryDto,
  ): Promise<Comment[]> {
    const { maxDepth, limit, offset } = queryDto;

    const rootComments = await this.commentRepository.find({
      where: {
        postId,
        parentId: null,
        isActive: true,
      },
      relations: ['author'],
      order: {
        createdAt: 'ASC',
      },
      take: limit,
      skip: offset,
    });

    for (const rootComment of rootComments) {
      rootComment.children = await this.loadChildComments(
        rootComment.id,
        1,
        maxDepth,
      );
    }

    return rootComments;
  }

  private async loadChildComments(
    parentId: number,
    currentDepth: number,
    maxDepth: number,
  ): Promise<Comment[]> {
    if (currentDepth >= maxDepth) {
      return [];
    }

    const children = await this.commentRepository.find({
      where: {
        parentId,
        isActive: true,
      },
      relations: ['author'],
      order: {
        createdAt: 'ASC',
      },
    });

    for (const child of children) {
      child.children = await this.loadChildComments(
        child.id,
        currentDepth + 1,
        maxDepth,
      );
    }

    return children;
  }

  async getCommentById(id: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id, isActive: true },
      relations: ['author', 'post'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  async getCommentsByUser(
    userId: number,
    limit: number = 20,
    offset: number = 0,
  ): Promise<Comment[]> {
    return this.commentRepository.find({
      where: {
        authorId: userId,
        isActive: true,
      },
      relations: ['post', 'author'],
      order: {
        createdAt: 'DESC',
      },
      take: limit,
      skip: offset,
    });
  }
}