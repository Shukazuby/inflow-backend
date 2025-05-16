import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export enum Visibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  FOLLOWERS_ONLY = 'followers_only',
}

export class CreatePostDto {
@ApiProperty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  media?: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiProperty()
  @IsString()
  category: string;

  @ApiProperty({
    required: false,
    type: String,
    enum: Visibility

  })
  @IsEnum(Visibility)
  visibility: Visibility;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  mint?: boolean;
}
