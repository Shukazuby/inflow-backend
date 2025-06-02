import { IsOptional, IsEnum, IsNumberString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum CommentOrderType {
  CHRONOLOGICAL = 'chronological',
  NESTED = 'nested',
}

export class GetCommentsQueryDto {
  @ApiPropertyOptional({
    enum: CommentOrderType,
    default: CommentOrderType.CHRONOLOGICAL,
    description: 'Order type for comments - chronological or nested',
  })
  @IsOptional()
  @IsEnum(CommentOrderType, {
    message: 'Order must be either "chronological" or "nested"',
  })
  @Transform(({ value }) => value?.toLowerCase())
  order?: CommentOrderType = CommentOrderType.CHRONOLOGICAL;

  @ApiPropertyOptional({
    description: 'Maximum depth for nested comments (only applies to nested order)',
    default: 3,
  })
  @IsOptional()
  @IsNumberString({}, { message: 'Max depth must be a valid number' })
  @Transform(({ value }) => parseInt(value, 10))
  maxDepth?: number = 3;

  @ApiPropertyOptional({
    description: 'Number of comments per page',
    default: 50,
  })
  @IsOptional()
  @IsNumberString({}, { message: 'Limit must be a valid number' })
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 50;

  @ApiPropertyOptional({
    description: 'Offset for pagination',
    default: 0,
  })
  @IsOptional()
  @IsNumberString({}, { message: 'Offset must be a valid number' })
  @Transform(({ value }) => parseInt(value, 10))
  offset?: number = 0;
}

