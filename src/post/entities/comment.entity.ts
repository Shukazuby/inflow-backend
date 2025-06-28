import { ApiProperty } from '@nestjs/swagger';

export class Comment {
  @ApiProperty({ example: 'clgk29u8h0000356cpzjh5v2k', description: 'The unique ID of the comment' })
  id: string;

  @ApiProperty({
    example: 'Great post! Thanks for sharing this information.',
    description: 'The content of the comment',
  })
  content: string;

  @ApiProperty({ example: 'clgk29u8h0000356cpzjh5v2k', description: 'The ID of the post this comment belongs to' })
  postId: string;

  @ApiProperty({ example: 'clgk29u8h0000356cpzjh5v2k', description: 'The ID of the user who created the comment' })
  userId: string;

  @ApiProperty({
    example: '2025-05-16T14:30:00Z',
    description: 'When the comment was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-05-16T14:30:00Z',
    description: 'When the comment was last updated',
  })
  updatedAt: Date;

  @ApiProperty({ description: 'The user who created the comment', required: false })
  user?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
} 