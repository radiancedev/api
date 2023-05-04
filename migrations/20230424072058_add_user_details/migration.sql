-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar_hash" TEXT,
ADD COLUMN     "banner_hash" TEXT,
ADD COLUMN     "biography" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "url" TEXT;
