import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);
  
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createPostDto: CreatePostDto) {
    try {
      const { content, media, tags, category, visibility, mint } = createPostDto;
      
      const allowedVisibilities = ['public', 'private', 'followers_only'];
      if (!allowedVisibilities.includes(visibility)) {
        throw new Error(`Invalid visibility value: ${visibility}`);
      }

      const post = await this.prisma.post.create({
        data: {
          userId,
          content,
          media,
          tags,
          category,
          visibility,
        },
      });

      return {
        message: 'Post created',
        post,
      };
    } catch (error) {
      this.logger.error('Post creation failed:', error.stack);
      throw new Error(`Post creation failed: ${error.message}`);
    }
  }

  findAll() {
    return `This action returns all post`;
  }

  findOne(id: string) {
    return `This action returns a #${id} post`;
  }

  update(id: string, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  async remove(id: string) {
    try {
      // First, check if the post exists
      const post = await this.prisma.post.findUnique({
        where: { id },
      });

      if (!post) {
        throw new NotFoundException(`Post with ID ${id} not found`);
      }

      // Check if the post has an associated NFT - for this implementation
      // we'll need to check if post has any property indicating it's an NFT
      // Since the schema doesn't explicitly show this, we'll need to assume
      // a method exists to determine this

      // Placeholder for NFT detection - this would normally connect to your
      // blockchain or NFT service to check if this post has a minted NFT
      const isNFT = true; // Replace with actual NFT detection logic when implemented

      if (isNFT) {
        // If it's an NFT, we need to burn it on-chain before deletion
        try {
          // TODO: Implement the on-chain burn operation
          // This would connect to your blockchain service or utility
          this.logger.log(
            `NFT post ${id} burn operation would be triggered here`,
          );

          // Placeholder for burn operation
          // When implementing NFT functionality, replace this with actual burn code:
          // Example: await blockchainService.burnNFT(post.tokenId);

          // After successful burn, delete the post
          await this.prisma.post.delete({
            where: { id },
          });

          return {
            message: `NFT post with ID ${id} has been successfully burned and deleted`,
          };
        } catch (burnError) {
          // If burn operation fails, log the error and throw it to trigger rollback
          this.logger.error(`Failed to burn NFT post ${id}:`, burnError.stack);
          throw new Error(`NFT burn operation failed: ${burnError.message}`);
        }
      } else {
        // For non-NFT posts, simply delete the post
        await this.prisma.post.delete({
          where: { id },
        });

        return {
          message: `Post with ID ${id} has been successfully deleted`,
        };
      }
    } catch (error) {
      this.logger.error(`Post deletion failed for ID ${id}:`, error.stack);
      // Re-throw the error to be handled by the controller
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Post deletion failed: ${error.message}`);
    }
  }
}