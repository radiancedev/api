/*
  Warnings:

  - Added the required column `type` to the `interactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "interactions" ADD COLUMN     "type" "InteractionType" NOT NULL;
