import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AppConfig } from './config';
import { PrismaModule, loggingMiddleware } from 'nestjs-prisma';

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
  
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
