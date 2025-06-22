import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostModule } from '../../post/post.module';
import { PostShareActivity } from './entities/post-share-activity.entity';
import { PostShareController } from './post-share.controller';
import { PostShareService } from './post-share.service';

/**
 * The module responsible for post share functionality.
 */
@Module({
  imports: [TypeOrmModule.forFeature([PostShareActivity]), PostModule],
  controllers: [PostShareController],
  providers: [PostShareService],
})
export class PostShareModule {}
