import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { PrismaService } from 'nestjs-prisma';
import { JwtService } from '@nestjs/jwt';
import { sign } from 'crypto';

describe('WalletService', () => {
  let service: WalletService;

  const prismaMock = {
    wallet: {
      deleteMany: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    revokedToken: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    // const module: TestingModule = await Test.createTestingModule({
    //   providers: [
    //     WalletService,
    //     {
    //       provide: PrismaService,
    //       useValue: prismaMock,
    //     },
    //   ],
    // }).compile();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: { sign: jest.fn() } },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('disconnectWallet', () => {
    it('should delete specific wallet when address provided', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        refreshToken: 'mockToken',
      });

      await service.disconnectWallet('user123', '0xABC');

      expect(prismaMock.wallet.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user123', address: '0xABC' },
      });

      expect(prismaMock.revokedToken.create).toHaveBeenCalledWith({
        data: { token: 'mockToken', userId: 'user123' },
      });

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'user123' },
        data: { refreshToken: null },
      });
    });

    it('should update wallet if no address is provided', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        refreshToken: 'mockToken',
      });

      await service.disconnectWallet('user456');

      expect(prismaMock.wallet.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user456', isPrimary: true },
        data: { isPrimary: false },
      });

      expect(prismaMock.revokedToken.create).toHaveBeenCalled();
      expect(prismaMock.user.update).toHaveBeenCalled();
    });

    it('should revoke refresh token if exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ refreshToken: 'rt' });

      await service.disconnectWallet('user1', '0xA11');

      expect(prismaMock.revokedToken.create).toHaveBeenCalledWith({
        data: { token: 'rt', userId: 'user1' },
      });

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: { refreshToken: null },
      });
    });

    it('should not revoke token if user has no refreshToken', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ refreshToken: null });

      await service.disconnectWallet('user789', '0xDEF');

      expect(prismaMock.revokedToken.create).not.toHaveBeenCalled();
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });
  });

  describe('getWalletStatus', () => {
    it('should return correct wallet status', async () => {
      prismaMock.wallet.findMany.mockResolvedValue([
        { address: '0xABC' },
        { address: '0xDEF' },
      ]);

      const result = await service.getWalletStatus('user123');

      expect(result).toEqual({
        connected: true,
        addresses: ['0xABC', '0xDEF'],
      });

      expect(prismaMock.wallet.findMany).toHaveBeenCalledWith({
        where: { userId: 'user123' },
        select: { address: true },
      });
    });

    it('should return connected false when no wallets found', async () => {
      prismaMock.wallet.findMany.mockResolvedValue([]);

      const result = await service.getWalletStatus('user123');

      expect(result).toEqual({
        connected: false,
        addresses: [],
      });
    });
  });
});
