import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { UnauthorizedException } from '@nestjs/common';

describe('WalletController (Auth Flow)', () => {
  let controller: WalletController;
  let service: Partial<WalletService>;

  beforeEach(async () => {
    service = {
      requestNonce: jest.fn(),
      connectWallet: jest.fn(),
      // existing methods for completeness
      disconnectWallet: jest.fn(),
      getWalletStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [{ provide: WalletService, useValue: service }],
    }).compile();

    controller = module.get<WalletController>(WalletController);
  });

  describe('requestNonce', () => {
    it('should call service.requestNonce with correct address and return nonce', async () => {
      const dto = { address: '0xABC' };
      (service.requestNonce as jest.Mock).mockResolvedValue({
        nonce: 'deadbeef',
      });

      const result = await controller.requestNonce(dto);

      expect(service.requestNonce).toHaveBeenCalledWith(dto.address);
      expect(result).toEqual({ nonce: 'deadbeef' });
    });

    it('should propagate errors from service', async () => {
      const dto = { address: '0xBAD' };
      (service.requestNonce as jest.Mock).mockRejectedValue(
        new Error('failed'),
      );

      await expect(controller.requestNonce(dto)).rejects.toThrow('failed');
    });
  });

  describe('connectWallet', () => {
    it('should call service.connectWallet with correct args and return token', async () => {
      const dto = { address: '0xDEF', signature: '0xsomesig' };
      (service.connectWallet as jest.Mock).mockResolvedValue({
        token: 'jwt-token',
      });

      const result = await controller.connectWallet(dto);

      expect(service.connectWallet).toHaveBeenCalledWith(
        dto.address,
        dto.signature,
      );
      expect(result).toEqual({ token: 'jwt-token' });
    });

    it('should propagate UnauthorizedException from service', async () => {
      const dto = { address: '0xDEF', signature: '0xsomesig' };
      (service.connectWallet as jest.Mock).mockRejectedValue(
        new UnauthorizedException('Invalid'),
      );

      await expect(controller.connectWallet(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
