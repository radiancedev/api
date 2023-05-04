/*
  Warnings:

  - You are about to drop the `group_assignments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "group_assignments" DROP CONSTRAINT "group_assignments_group_id_fkey";

-- DropForeignKey
ALTER TABLE "group_assignments" DROP CONSTRAINT "group_assignments_user_id_fkey";

-- DropTable
DROP TABLE "group_assignments";

-- CreateTable
CREATE TABLE "GroupAssignment" (
    "group_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "GroupAssignment_pkey" PRIMARY KEY ("group_id","user_id")
);

-- AddForeignKey
ALTER TABLE "GroupAssignment" ADD CONSTRAINT "GroupAssignment_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupAssignment" ADD CONSTRAINT "GroupAssignment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
