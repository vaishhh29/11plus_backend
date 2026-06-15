/*
  Warnings:

  - Added the required column `email` to the `parent_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `parent_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `student_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `student_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "parent_profiles" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "student_profiles" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "prepMode" TEXT,
ADD COLUMN     "targetedSchool" TEXT,
ADD COLUMN     "year" TEXT;
