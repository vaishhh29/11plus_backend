/*
  Warnings:

  - You are about to drop the `student_parents` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "student_parents" DROP CONSTRAINT "student_parents_parentId_fkey";

-- DropForeignKey
ALTER TABLE "student_parents" DROP CONSTRAINT "student_parents_studentId_fkey";

-- AlterTable
ALTER TABLE "student_profiles" ADD COLUMN     "parentId" INTEGER;

-- DropTable
DROP TABLE "student_parents";

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "parent_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
