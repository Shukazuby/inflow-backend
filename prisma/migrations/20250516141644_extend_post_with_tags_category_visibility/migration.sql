/*
  Warnings:

  - A unique constraint covering the columns `[address]` on the table `Nonce` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('public', 'private', 'followers_only');

-- AlterTable
ALTER TABLE "Nonce" ADD COLUMN     "expiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "media" TEXT,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "visibility" "Visibility" NOT NULL DEFAULT 'public';

-- CreateIndex
CREATE UNIQUE INDEX "Nonce_address_key" ON "Nonce"("address");
