-- Add denormalized columns to student_teachers
ALTER TABLE "student_teachers" 
ADD COLUMN "studentName" TEXT,
ADD COLUMN "grade" TEXT,
ADD COLUMN "targetedSchool" TEXT,
ADD COLUMN "teacherName" TEXT,
ADD COLUMN "teacherEmail" TEXT;

-- Backfill from related tables
UPDATE "student_teachers" st
SET 
  "studentName" = sp.name,
  "grade" = sp.grade,
  "targetedSchool" = sp."targetedSchool",
  "teacherName" = tp.name,
  "teacherEmail" = tp.email
FROM "student_profiles" sp, "teacher_profiles" tp
WHERE st."studentId" = sp.id AND st."teacherId" = tp.id;
