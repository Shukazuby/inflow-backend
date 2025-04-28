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

// Define a type for the user object attached to the request by JwtAuthGuard
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    // include other fields from your safeUser object if needed
  };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  findOneById(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }

  @Get('username/:username')
  findOneByUsername(@Param('username') username: string) {
    // Remove potential leading '@' from username handle
    const cleanedUsername = username.startsWith('@')
      ? username.substring(1)
      : username;
    return this.usersService.findOneByUsername(cleanedUsername);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    // Check if the authenticated user is trying to update their own profile
    if (req.user.id !== id) {
      throw new ForbiddenException('You can only update your own profile.');
    }
    return this.usersService.update(id, updateUserDto);
  }
}
