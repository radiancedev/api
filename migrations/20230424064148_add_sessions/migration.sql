/*
  Warnings:

  - You are about to drop the `GroupAssignment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GroupAssignment" DROP CONSTRAINT "GroupAssignment_group_id_fkey";

-- DropForeignKey
ALTER TABLE "GroupAssignment" DROP CONSTRAINT "GroupAssignment_user_id_fkey";

-- DropTable
DROP TABLE "GroupAssignment";

-- CreateTable
CREATE TABLE "group_assignments" (
    "group_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "group_assignments_pkey" PRIMARY KEY ("group_id","user_id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "group_assignments" ADD CONSTRAINT "group_assignments_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_assignments" ADD CONSTRAINT "group_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
