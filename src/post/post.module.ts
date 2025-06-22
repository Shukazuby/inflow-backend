import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { LoggerMiddleware } from 'src/common/logger.middleware';

@Module({
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('posts'); // or .forRoutes('*') to catch everything
  }
}
