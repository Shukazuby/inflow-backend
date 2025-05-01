import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) { }

  async disconnectWallet(userId: string, address?: string) {
    try {
      if (address) {
        await this.prisma.wallet.deleteMany({
          where: { userId, address }
        });
      } else {
        // Drop all if no address is provided
        await this.prisma.wallet.updateMany({
          where: { userId, isPrimary: true },
          data: { isPrimary: false }
        });
      }

      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user?.refreshToken) {
        await this.prisma.revokedToken.create({
          data: { token: user.refreshToken, userId },
        });
        await this.prisma.user.update({
          where: { id: userId },
          data: { refreshToken: null },
        });
      }
    } catch (err) {
      console.error('Error disconnecting wallet', err);
      throw new Error('Failed to disconnect wallet');
    }
  }

  async getWalletStatus(userId: string) {
    const wallets = await this.prisma.wallet.findMany({
      where: { userId },
      select: { address: true },
    });
    return {
      connected: wallets.length > 0,
      addresses: wallets.map(w => w.address),
    };
  }
}