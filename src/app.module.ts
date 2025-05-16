import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AppConfig } from './config';
import { PrismaModule, loggingMiddleware } from 'nestjs-prisma';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CacheModule } from '@nestjs/cache-manager';
import { WalletModule } from './wallet/wallet.module';
import { PostModule } from './post/post.module';

@Module({
  imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        cache: true,
        load: [AppConfig],
      }),
      PrismaModule.forRoot({
        isGlobal: true,
        prismaServiceOptions: {
          middlewares: [
            loggingMiddleware({
              logger: new Logger('PrismaMiddleware'),
              logLevel: 'log',
            }),
          ],
        },
      }),
      CacheModule.register({
        isGlobal: true,
        ttl: 60 * 5, // 5 minutes cache TTL
      }),
      AuthModule,
      UsersModule,
      WalletModule,
      PostModule,
  
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
