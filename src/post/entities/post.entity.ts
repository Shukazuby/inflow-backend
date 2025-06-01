import { ApiProperty } from '@nestjs/swagger';
import { OneToMany } from 'typeorm';
import { Comment } from '../../comments/entities/comment.entity';



export class Post {
  @ApiProperty({ example: 1, description: 'The unique ID of the post' })
  id: number;

  @ApiProperty({
    example: 'My First Post',
    description: 'The title of the post',
  })
  title: string;

  @ApiProperty({
    example: 'This is the content of my post...',
    description: 'The content of the post',
  })
  content: string;

  @ApiProperty({ example: 1, description: 'The ID of the author' })
  authorId: number;

  @ApiProperty({
    example: ['tech', 'web3'],
    description: 'Tags associated with the post',
    required: false,
  })
  tags?: string[];

  @ApiProperty({
    example: 'Technology',
    description: 'Category of the post',
    required: false,
  })
  category?: string;

  @ApiProperty({
    example: 'public',
    description: 'Visibility of the post',
    required: false,
  })
  visibility?: string;

  @ApiProperty({
    example: '2025-05-16T14:30:00Z',
    description: 'When the post was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-05-16T14:30:00Z',
    description: 'When the post was last updated',
  })
  updatedAt: Date;

  @ApiProperty({ description: 'The author of the post', required: false })
  author?: any;

  @OneToMany(() => Comment, comment => comment.post, { cascade: true })
comments: Comment[];

// Also add this computed property for comment count:
@Column({ name: 'comment_count', default: 0 })
commentCount: number;
}
function Column(arg0: { name: string; default: number; }): (target: Post, propertyKey: "commentCount") => void {
  throw new Error('Function not implemented.');
}

