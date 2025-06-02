import { OneToMany } from 'typeorm';
import { Comment } from '../../comments/entities/comment.entity';

export class User {
  @OneToMany(() => Comment, comment => comment.author)
  comments: Comment[];
}
