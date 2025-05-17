import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import { JwtAuthGuard } from 'src/guards/jwt.strategy'; // Assuming JwtAuthGuard is exported from here
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserStatsDto } from './dto/UserStats.dto';

// Define a type for the user object attached to the request by JwtAuthGuard
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    // include other fields from your safeUser object if needed
  };
}
@ApiBearerAuth('jwt-auth')
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async findOneById(@Param('id') id: string) {
    return await this.usersService.findOneById(id);
  }

  @Get('username/:username')
  async findOneByUsername(@Param('username') username: string) {
    // Remove potential leading '@' from username handle
    const cleanedUsername = username.startsWith('@')
      ? username.substring(1)
      : username;
    return await this.usersService.findOneByUsername(cleanedUsername);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    // Check if the authenticated user is trying to update their own profile
    if (req.user.id !== id) {
      throw new ForbiddenException('You can only update your own profile.');
    }
    return await this.usersService.update(id, updateUserDto);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns user statistics for profile and rankings',
    type: UserStatsDto,
  })
  async getUserStats(@Param('id') id: string) {
    return await this.usersService.getUserStats(id);
  }
}
