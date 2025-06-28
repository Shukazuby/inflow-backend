import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'The content of the comment',
    example: 'Great post! Thanks for sharing this information.',
    minLength: 1,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Comment content cannot be empty' })
  @MaxLength(1000, { message: 'Comment content cannot exceed 1000 characters' })
  @Matches(/^[^\s].*[^\s]$|^[^\s]$/, {
    message: 'Comment content cannot start or end with whitespace',
  })
  content: string;
} 