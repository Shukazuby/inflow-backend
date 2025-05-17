import { Module } from '@nestjs/common';
import { PrismaModule } from 'nestjs-prisma';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule],
  controllers: [WalletController],
  providers: [WalletService, JwtService],
})
export class WalletModule {}
