import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';

export class CommentAuthorDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  username: string;

  @ApiPropertyOptional()
  @Expose()
  avatar?: string;
}

export class CommentResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  content: string;

  @ApiProperty()
  @Expose()
  postId: number;

  @ApiPropertyOptional()
  @Expose()
  parentId?: number;

  @ApiProperty()
  @Expose()
  @Transform(({ value }) => value.toISOString())
  createdAt: Date;

  @ApiProperty()
  @Expose()
  @Transform(({ value }) => value.toISOString())
  updatedAt: Date;

  @ApiProperty({ type: CommentAuthorDto })
  @Expose()
  @Type(() => CommentAuthorDto)
  author: CommentAuthorDto;

  @ApiPropertyOptional({ type: [CommentResponseDto] })
  @Expose()
  @Type(() => CommentResponseDto)
  children?: CommentResponseDto[];

  @ApiPropertyOptional()
  @Expose()
  replyCount?: number;
}
