import { ApiProperty } from '@nestjs/swagger';

export class UserStatsDto {
  @ApiProperty({ description: 'The number of followers for the user' })
  followersCount: number;

  @ApiProperty({ description: 'The number of users the user is following' })
  followingCount: number;

  @ApiProperty({ description: 'The number of posts created by the user' })
  postCount: number;

  @ApiProperty({ description: 'The total amount of tips received by the user' })
  totalTipsReceived: number;
}
