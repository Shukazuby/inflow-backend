import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt.strategy';
import { WalletService } from './wallet.service';
import {
  ConnectWalletDto,
  DisconnectWalletDto,
  RequestNonceDto,
} from './dto/wallet.dto';
import { Request as ExpressRequest } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Wallet')
@Controller('auth/wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Post('disconnect')
  @ApiBearerAuth('jwt-auth')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async disconnectWallet(
    @Request() req: ExpressRequest,
    @Body() dto: DisconnectWalletDto,
  ) {
    const result = await this.walletService.disconnectWallet(
      req['user'].id,
      dto.address,
    );
    return result;
  }

  @Get('status')
  @ApiBearerAuth('jwt-auth')
  @UseGuards(JwtAuthGuard)
  async walletStatus(@Request() req: ExpressRequest) {
    const statusData = await this.walletService.getWalletStatus(req['user'].id);
    return { status: 'success', data: statusData };
  }

  @Post('connect')
  async connectWallet(@Body() dto: ConnectWalletDto) {
    return this.walletService.connectWallet(dto.address, dto.signature);
  }

  @Post('request-nonce')
  async requestNonce(@Body() dto: RequestNonceDto) {
    return this.walletService.requestNonce(dto.address);
  }
}
