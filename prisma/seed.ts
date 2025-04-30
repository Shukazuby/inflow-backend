import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean up existing data
  await prisma.tip.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.follow.deleteMany({});
  await prisma.revokedToken.deleteMany({});
  await prisma.wallet.deleteMany({});
  await prisma.user.deleteMany({});

  // Create users
  const password = await bcrypt.hash('password123', 10);
  
  const user1 = await prisma.user.create({
    data: {
      username: 'testuser1',
      email: 'user1@example.com',
      password,
      bio: 'This is test user 1',
      role: 'USER',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: 'testuser2',
      email: 'user2@example.com',
      password,
      bio: 'This is test user 2',
      role: 'USER',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      username: 'testuser3',
      email: 'user3@example.com',
      password,
      bio: 'This is test user 3',
      role: 'USER',
    },
  });

  // Create follows
  await prisma.follow.create({
    data: {
      followerId: user2.id,
      followingId: user1.id,
    },
  });

  await prisma.follow.create({
    data: {
      followerId: user3.id,
      followingId: user1.id,
    },
  });

  await prisma.follow.create({
    data: {
      followerId: user1.id,
      followingId: user2.id,
    },
  });

  // Create posts
  const post1 = await prisma.post.create({
    data: {
      userId: user1.id,
      content: 'This is post 1 by user 1',
    },
  });

  const post2 = await prisma.post.create({
    data: {
      userId: user1.id,
      content: 'This is post 2 by user 1',
    },
  });

  const post3 = await prisma.post.create({
    data: {
      userId: user2.id,
      content: 'This is post 1 by user 2',
    },
  });

  // Create tips
  await prisma.tip.create({
    data: {
      amount: 10,
      senderId: user2.id,
      receiverId: user1.id,
      postId: post1.id,
    },
  });

  await prisma.tip.create({
    data: {
      amount: 5,
      senderId: user3.id,
      receiverId: user1.id,
      postId: post2.id,
    },
  });

  await prisma.tip.create({
    data: {
      amount: 7.5,
      senderId: user1.id,
      receiverId: user2.id,
      postId: post3.id,
    },
  });

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
