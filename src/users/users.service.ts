import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import { User } from '@prisma/client';

// Helper function to strip sensitive fields
const selectSafeUserFields = {
  id: true,
  username: true,
  email: true, // Decide if email should be public
  bio: true,
  avatarUrl: true,
  preferences: true, // Decide if preferences should be public
  role: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOneById(
    id: string,
  ): Promise<Omit<User, 'password' | 'refreshToken'>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      // select: selectSafeUserFields,
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async findOneByUsername(
    username: string,
  ): Promise<Omit<User, 'password' | 'refreshToken'>> {
    const normalizedUsername = username.toLowerCase(); // Normalize username
    const user = await this.prisma.user.findUnique({
      where: { username: normalizedUsername },
      select: selectSafeUserFields,
    });
    if (!user) {
      throw new NotFoundException(`User with username "${username}" not found`);
    }
    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password' | 'refreshToken'>> {
    // Basic input sanitation (example for bio)
    if (updateUserDto.bio) {
      // Replace this with a more robust sanitizer if needed
      updateUserDto.bio = updateUserDto.bio.replace(
        /<script.*?>.*?<\/script>/gi,
        '',
      );
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
        select: selectSafeUserFields,
      });
      return updatedUser;
    } catch (error) {
      // Handle potential Prisma errors, e.g., record not found
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with ID "${id}" not found`);
      }
      throw error; // Re-throw other errors
    }
  }
}
