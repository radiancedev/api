/*
  Warnings:

  - You are about to drop the column `permission_level` on the `groups` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "groups" DROP COLUMN "permission_level",
ADD COLUMN     "permissions" INTEGER NOT NULL DEFAULT 0;

-- DropEnum
DROP TYPE "PermissionLevel";
