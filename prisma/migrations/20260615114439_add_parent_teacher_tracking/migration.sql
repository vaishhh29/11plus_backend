/*
  Warnings:

  - You are about to drop the column `prepMode` on the `student_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `student_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "parent_profiles" ADD COLUMN     "contactInfo" TEXT;

-- AlterTable
ALTER TABLE "student_profiles" DROP COLUMN "prepMode",
DROP COLUMN "year";

-- CreateTable
CREATE TABLE "parent_teachers" (
    "parentId" INTEGER NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parent_teachers_pkey" PRIMARY KEY ("parentId","teacherId")
);

-- AddForeignKey
ALTER TABLE "parent_teachers" ADD CONSTRAINT "parent_teachers_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "parent_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_teachers" ADD CONSTRAINT "parent_teachers_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teacher_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
