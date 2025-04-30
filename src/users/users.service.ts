import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import { User } from '@prisma/client';
import { UserStatsDto } from './dto/UserStats.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';

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
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

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
      
      // Invalidate the cache when user data changes
      await this.cacheManager.del(`user-stats-${id}`);
      
      return updatedUser;
    } catch (error) {
      // Handle potential Prisma errors, e.g., record not found
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with ID "${id}" not found`);
      }
      throw error; // Re-throw other errors
    }
  }

  async getUserStats(id: string): Promise<UserStatsDto> {
    // Try to get stats from cache first
    const cacheKey = `user-stats-${id}`;
    const cachedStats = await this.cacheManager.get<UserStatsDto>(cacheKey);
    
    if (cachedStats) {
      return cachedStats;
    }
    
    // If not in cache, fetch from database
    // Check if user exists
    const userExists = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!userExists) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    // Using Prisma to efficiently get counts
    const [followersCount, followingCount, postCount, tips] = await Promise.all([
      // Count followers
      this.prisma.follow.count({
        where: { followingId: id },
      }),
      
      // Count following
      this.prisma.follow.count({
        where: { followerId: id },
      }),
      
      // Count posts
      this.prisma.post.count({
        where: { userId: id },
      }),
      
      // Sum tips received
      this.prisma.tip.aggregate({
        where: { receiverId: id },
        _sum: {
          amount: true,
        },
      }),
    ]);

    // Prepare the response
    const stats = {
      followersCount,
      followingCount,
      postCount,
      totalTipsReceived: tips._sum.amount || 0, // Use 0 if no tips received
    };
    
    // Store in cache for future requests
    await this.cacheManager.set(cacheKey, stats);
    
    return stats;
  }
}
