// wallet.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { UnauthorizedException } from '@nestjs/common';

describe('WalletController', () => {
  let controller: WalletController;
  let service: Partial<WalletService>;

  beforeEach(async () => {
    service = {
      disconnectWallet: jest.fn(),
      getWalletStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [{ provide: WalletService, useValue: service }],
    }).compile();

    controller = module.get<WalletController>(WalletController);
  });

  describe('disconnectWallet', () => {
    const mockReq: any = {
      headers: { authorization: 'Bearer token' },
      user: { userId: 'user1' },
    };

    it('should throw UnauthorizedException if no token', async () => {
      const badReq = { ...mockReq, headers: {} };

      await expect(controller.disconnectWallet(badReq, { address: '0xABC' })).rejects.toThrow(UnauthorizedException);
    });

    it('should call service.disconnectWallet with correct args', async () => {
      await controller.disconnectWallet(mockReq, { address: '0x123' });

      expect(service.disconnectWallet).toHaveBeenCalledWith('user1', '0x123');
    });

    it('should call disconnectWallet with undefined address with none is provided', async () => {
      await controller.disconnectWallet(mockReq, {});

      expect(service.disconnectWallet).toHaveBeenCalledWith('user1', undefined);
    });
  });

  describe('walletStatus', () => {
    const mockReq: any = {
      user: { userId: 'user1' }
    };

    it('should return status data', async () => {
      (service.getWalletStatus as jest.Mock).mockResolvedValue({
        connected: true,
        addresses: ['0xHIJ']
      });

      const result = await controller.walletStatus(mockReq);

      expect(result).toEqual({
        status: 'success',
        data: { connected: true, addresses: ['0xHIJ'] }
      });
    });
  });
});