import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @Length(0, 280) // Example length limit for bio
  bio?: string;

  @ApiProperty()
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  preferences?: string; // Keep as string for now, could be JSON object later
}
