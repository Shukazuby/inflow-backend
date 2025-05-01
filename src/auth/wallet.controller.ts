import { Body, Controller, Get, HttpCode, Post, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/guards/jwt.strategy";
import { WalletService } from "./wallet.service";
import { DisconnectWalletDto } from "./dto/disconnect-wallet.dto";


@Controller('auth/wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private walletService: WalletService) { }

  @Post('disconnect')
  @HttpCode(204)
  async disconnectWallet(@Request() req, @Body() dto: DisconnectWalletDto) {
    // Grab raw token and revoke
    const rawToken = req.headers.authorization?.split(' ')[1];
    await this.walletService.disconnectWallet(
      req.user.userId,
      rawToken || '',
      dto.address
    );
  }

  @Get('status')
  async walletStatus(@Request() req) {
    return this.walletService.getWalletStatus(req.user.userId);
  }
}