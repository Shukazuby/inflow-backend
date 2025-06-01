import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { CommentResponseDto } from './comment-response.dto';

export class CommentsListResponseDto {
  @ApiProperty({ type: [CommentResponseDto] })
  @Expose()
  @Type(() => CommentResponseDto)
  comments: CommentResponseDto[];

  @ApiProperty()
  @Expose()
  total: number;

  @ApiProperty()
  @Expose()
  hasMore: boolean;

  @ApiProperty()
  @Expose()
  order: string;
}