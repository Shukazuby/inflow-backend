import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class DisconnectWalletDto {
  @ApiProperty({
    example: '0xabc123...def456',
    description: 'User wallet address',
  })
  @IsOptional()
  @IsString()
  address?: string;
}

export class WalletStatusDto {
  @ApiProperty({
    example: true,
    description: 'Indicates if wallet is connected',
  })
  @IsBoolean()
  connected: boolean;

  @ApiProperty({
    example: '0xabc123...def456',
    description: 'Connected wallet address',
  })
  @IsString()
  address: string;
}

export class RequestNonceDto {
  @ApiProperty({ example: '0x123...', description: 'User wallet address' })
  @IsString()
  address: string;
}

export class ConnectWalletDto {
  @ApiProperty({
    example: '0x123...def',
    description: 'User wallet address',
  })
  @IsString()
  address: string;

  @ApiProperty({
    example: '0xdeadbeef...123',
    description: 'signature of nonce signed by user wallet',
  })
  @IsString()
  signature: string;
}
