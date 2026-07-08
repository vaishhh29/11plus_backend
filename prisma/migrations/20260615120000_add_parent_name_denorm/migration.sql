-- Add parentName column to student_profiles
ALTER TABLE "student_profiles" ADD COLUMN "parentName" TEXT;

-- Backfill parentName from parent_profiles
UPDATE "student_profiles" sp
SET "parentName" = pp.name
FROM "parent_profiles" pp
WHERE sp."parentId" = pp.id;
