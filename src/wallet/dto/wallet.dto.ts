import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class DisconnectWalletDto {
  @ApiProperty({ example: '0xabc123...def456', description: 'User wallet address' })
  @IsOptional()
  @IsString()
  address?: string;
}

export class WalletStatusDto {
  @ApiProperty({ example: true, description: 'Indicates if wallet is connected' })
  @IsBoolean()
  connected: boolean;

  @ApiProperty({ example: '0xabc123...def456', description: 'Connected wallet address' })
  @IsString()
  address: string;
}