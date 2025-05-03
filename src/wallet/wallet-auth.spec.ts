import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { PrismaService } from 'nestjs-prisma';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

// Mock verifySignature from util
jest.mock('src/utils/starknet.utils', () => ({
  verifySignature: jest.fn(),
}));
import { verifySignature } from 'src/utils/starknet.utils';

describe('WalletService (Auth Flow)', () => {
  let service: WalletService;
  let prismaMock: any;
  let jwtMock: { sign: jest.Mock };

  beforeEach(async () => {
    prismaMock = {
      nonce: {
        upsert: jest.fn(),
        findFirst: jest.fn(),
        delete: jest.fn(),
      },
      wallet: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };
    jwtMock = { sign: jest.fn(() => 'signed-jwt') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtMock },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('requestNonce', () => {
    it('should upsert a nonce and return it', async () => {
      const address = '0xABC';
      prismaMock.nonce.upsert.mockResolvedValue({ nonce: 'deadbeef' });

      const result = await service.requestNonce(address);

      expect(prismaMock.nonce.upsert).toHaveBeenCalledWith({
        where: { address },
        update: expect.objectContaining({ nonce: expect.any(String), expiresAt: expect.any(Date) }),
        create: expect.objectContaining({ address, nonce: expect.any(String), expiresAt: expect.any(Date) }),
      });
      expect(result).toHaveProperty('nonce', expect.any(String));
    });
  });

  describe('connectWallet', () => {
    const address = '0xDEF';
    const signature = { r: 'r', s: 's' };

    it('should throw if no nonce record found', async () => {
      prismaMock.nonce.findFirst.mockResolvedValue(null);
      await expect(service.connectWallet(address, signature as any)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if signature invalid', async () => {
      prismaMock.nonce.findFirst.mockResolvedValue({ id: '1', nonce: 'n', expiresAt: new Date(Date.now() + 1000) });
      (verifySignature as jest.Mock).mockReturnValue(false);
      await expect(service.connectWallet(address, signature as any)).rejects.toThrow(UnauthorizedException);
    });

    it('should sign in existing wallet user and return token', async () => {
      const record = { id: '1', nonce: 'n', expiresAt: new Date(Date.now() + 1000) };
      prismaMock.nonce.findFirst.mockResolvedValue(record);
      (verifySignature as jest.Mock).mockReturnValue(true);
      prismaMock.wallet.findUnique.mockResolvedValue({ id: 'w1', address, user: { id: 'u1', username: 'u' } });

      const result = await service.connectWallet(address, signature as any);

      expect(prismaMock.nonce.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(prismaMock.wallet.findUnique).toHaveBeenCalledWith({ where: { address }, include: { user: true } });
      expect(jwtMock.sign).toHaveBeenCalledWith({ sub: 'u1', wallet: 'w1', address });
      expect(result).toEqual({ token: 'signed-jwt' });
    });

    it('should create new wallet and user if none exists and return token', async () => {
      const record = { id: '2', nonce: 'n2', expiresAt: new Date(Date.now() + 1000) };
      prismaMock.nonce.findFirst.mockResolvedValue(record);
      (verifySignature as jest.Mock).mockReturnValue(true);
      prismaMock.wallet.findUnique.mockResolvedValue(null);
      prismaMock.wallet.create.mockResolvedValue({
        id: 'w2', address, user: { id: 'u2', username: address },
      });

      const result = await service.connectWallet(address, signature as any);

      expect(prismaMock.wallet.create).toHaveBeenCalledWith({
        data: { address, user: { create: { username: address } } },
        include: { user: true },
      });
      expect(jwtMock.sign).toHaveBeenCalledWith({ sub: 'u2', wallet: 'w2', address });
      expect(result).toEqual({ token: 'signed-jwt' });
    });
  });
});