import { Body, Controller, Get, HttpCode, Post, Request, UnauthorizedException, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/guards/jwt.strategy";
import { WalletService } from "./wallet.service";
import { DisconnectWalletDto } from "./dto/wallet.dto";
import { Request as ExpressRequest } from "express";

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    userId: string;
  };
}


@Controller('auth/wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private walletService: WalletService) { }

  @Post('disconnect')
  @HttpCode(204)
  async disconnectWallet(
    @Request() req: AuthenticatedRequest,
    @Body() dto: DisconnectWalletDto,
  ) {
    // Grab raw token and revoke
    const rawToken = req.headers.authorization?.split(' ')[1];
    if (!rawToken) {
      throw new UnauthorizedException('Authorization token not found');
    }

    await this.walletService.disconnectWallet(
      req.user.userId,
      dto.address
    );
  }

  @Get('status')
  async walletStatus(@Request() req: AuthenticatedRequest) {
    const statusData = await this.walletService.getWalletStatus(req.user.userId);
    return { status: 'success', data: statusData }
  }
}