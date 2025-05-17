import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsEnum,
} from 'class-validator';
import { Visibility } from '@prisma/client';

export class CreatePostDto {
  @ApiProperty({
    description: 'Content of the post',
    example: 'This is my first post!',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Optional media URL (image/video) for the post',
    example: 'https://example.com/image.png',
    required: false,
  })
  @IsString()
  @IsOptional()
  media?: string;

  @ApiProperty({
    description: 'Tags associated with the post',
    example: ['nestjs', 'prisma', 'api'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'Category under which the post falls',
    example: 'technology',
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({
    description: 'Visibility level of the post',
    enum: Visibility,
    default: Visibility.public,
    required: false,
  })
  @IsEnum(Visibility)
  @IsOptional()
  visibility?: Visibility;
}
