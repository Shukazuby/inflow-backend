import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from '../../../post/entities/post.entity';

/**
 * Enum for the source platform where the post was shared.
 */
export enum ShareSource {
  Twitter = 'twitter',
  Facebook = 'facebook',
  LinkedIn = 'linkedin',
  Reddit = 'reddit',
  Email = 'email',
  Other = 'other',
}

/**
 * Represents the activity of a post being shared.
 */
@Entity('post_share_activities')
export class PostShareActivity {
  /**
   * The unique identifier for the share activity.
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * The ID of the post that was shared.
   */
  @Column({ type: 'uuid' })
  postId: string;

  /**
   * The post that was shared.
   */
  @ManyToOne(() => Post)
  @JoinColumn({ name: 'postId' })
  post: Post;

  /**
   * The ID of the user who shared the post (if authenticated).
   */
  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  /**
   * The IP address of the person who shared the post.
   */
  @Column()
  ipAddress: string;

  /**
   * The user agent of the device used to share the post.
   */
  @Column()
  userAgent: string;

  /**
   * The platform where the post was shared.
   */
  @Column({
    type: 'enum',
    enum: ShareSource,
    nullable: true,
  })
  source?: ShareSource;

  /**
   * An optional referral code used for tracking.
   */
  @Column({ length: 50, nullable: true })
  referralCode?: string;

  /**
   * Optional JSON data for tracking incentives.
   */
  @Column({ type: 'jsonb', nullable: true })
  incentiveData?: Record<string, any>;

  /**
   * The timestamp when the post was shared.
   */
  @CreateDateColumn()
  sharedAt: Date;
}
