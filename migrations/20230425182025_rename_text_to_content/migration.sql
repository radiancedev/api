/*
  Warnings:

  - You are about to drop the column `text` on the `posts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "posts" DROP COLUMN "text",
ADD COLUMN     "content" TEXT;
