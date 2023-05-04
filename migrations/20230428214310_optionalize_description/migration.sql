-- AlterTable
ALTER TABLE "groups" ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "description" SET DEFAULT 'No description provided.';
