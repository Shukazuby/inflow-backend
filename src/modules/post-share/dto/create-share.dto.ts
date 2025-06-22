import {
  IsAlphanumeric,
  IsEnum,
  IsObject,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ShareSource } from '../entities/post-share-activity.entity';

/**
 * Defines the data transfer object for creating a post share.
 */
export class CreateShareDto {
  /**
   * The platform where the post was shared.
   * @example 'twitter'
   */
  @IsOptional()
  @IsEnum(ShareSource)
  source?: ShareSource;

  /**
   * An optional referral code.
   * @example 'FRIEND123'
   */
  @IsOptional()
  @IsAlphanumeric()
  @MaxLength(50)
  referralCode?: string;

  /**
   * Optional JSON data for tracking incentives.
   * @example { "campaignId": "summer2024", "rewardType": "points" }
   */
  @IsOptional()
  @IsObject()
  incentiveData?: Record<string, any>;
} 