-- Add denormalized fields to teacher_requests
ALTER TABLE "teacher_requests"
ADD COLUMN "studentName" TEXT,
ADD COLUMN "grade" TEXT,
ADD COLUMN "parentName" TEXT,
ADD COLUMN "teacherName" TEXT;

-- Backfill denormalized fields from related tables
UPDATE "teacher_requests" tr
SET
  "studentName" = sp.name,
  "grade" = sp.grade,
  "parentName" = pp.name,
  "teacherName" = tp.name
FROM "student_profiles" sp,
     "parent_profiles" pp,
     "teacher_profiles" tp
WHERE tr."studentId" = sp.id
  AND tr."parentId" = pp.id
  AND tr."teacherId" = tp.id;