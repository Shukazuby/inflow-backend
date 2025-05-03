import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { randomBytes } from "crypto";
import { JwtService } from "@nestjs/jwt";
import { verifySignature, StarknetSignature } from "src/utils/starknet.utils";

@Injectable()
export class WalletService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

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

  async connectWallet(address: string, signature: StarknetSignature) {

    // find address in the latest nonce
    const record = await this.prisma.nonce.findFirst({
      where: {
        address,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!record) {
      throw new UnauthorizedException('No valid nonce found or it has expired');
    }

    // veryfy signature using starknet.js
    const isValid = verifySignature(record.nonce, signature, address);
    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }
    // Immediately invalidate nonce
    await this.prisma.nonce.delete({ where: { id: record.id } });

    // Find or create user (Nested, through wallet)if not available
    let wallet = await this.prisma.wallet.findUnique({
      where: { address },
      include: { user: true },
    });

    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: {
          address,
          user: { // create new user with wallet address as username
            create: { username: address },
          },
        },
        include: { user: true }, // include 'user' in the wallet object
      });
    }

    const user = wallet.user;

    const token = this.jwtService.sign({
      sub: user.id,
      wallet: wallet.id,
      address: wallet.address,
    });

    return { token };
  }

  async requestNonce(address: string) {

    // Generate 32-char hex string for nonce
    const nonce = randomBytes(16).toString('hex');
    // Valid for 5 mins
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Update nonce with address if found, create otherwise
    await this.prisma.nonce.upsert({
      where: { address },
      update: { nonce, createdAt: new Date(), expiresAt },
      create: { address, nonce, expiresAt },
    });

    return { nonce };
  }
}