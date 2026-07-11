/**
 * Subject-specific table resolver utility.
 * Maps subjectId (1=Maths, 2=English, 3=VR, 4=NVR) to the correct
 * Prisma model delegate for both syllabus and question tables.
 */
import prisma from '../config/database';

// Subject ID constants
export const SUBJECT_IDS = {
  MATHS: 1,
  ENGLISH: 2,
  VR: 3,
  NVR: 4,
} as const;

/**
 * Maps a subject name string to its canonical subject ID.
 */
export function resolveSubjectId(name: string): number {
  const lower = name.toLowerCase().trim();
  if (['math', 'maths', 'mathematics', 'numerical'].includes(lower)) return SUBJECT_IDS.MATHS;
  if (['english', 'literacy'].includes(lower)) return SUBJECT_IDS.ENGLISH;
  if (['verbal', 'verbal reasoning', 'vr'].includes(lower)) return SUBJECT_IDS.VR;
  if (['non-verbal', 'non-verbal reasoning', 'nvr', 'spatial'].includes(lower)) return SUBJECT_IDS.NVR;
  return SUBJECT_IDS.MATHS; // fallback
}

/**
 * Maps a subject name string to the canonical DB name used in the subjects table.
 */
export function resolveSubjectName(name: string): string {
  const lower = name.toLowerCase().trim();
  if (['math', 'maths', 'mathematics'].includes(lower)) return 'Maths';
  if (['english'].includes(lower)) return 'English';
  if (['verbal', 'verbal reasoning', 'vr'].includes(lower)) return 'Verbal Reasoning';
  if (['non-verbal', 'non-verbal reasoning', 'nvr'].includes(lower)) return 'Non-Verbal Reasoning';
  return name;
}

/**
 * Returns the Prisma delegate for the syllabus table of a given subjectId.
 */
export function getSyllabusModel(subjectId: number): any {
  switch (subjectId) {
    case SUBJECT_IDS.MATHS:   return prisma.mathsSyllabus;
    case SUBJECT_IDS.ENGLISH: return prisma.englishSyllabus;
    case SUBJECT_IDS.VR:      return prisma.vRSyllabus;
    case SUBJECT_IDS.NVR:     return prisma.nVRSyllabus;
    default: throw new Error(`Invalid subjectId: ${subjectId}`);
  }
}

/**
 * Returns the Prisma delegate for the question table of a given subjectId.
 */
export function getQuestionModel(subjectId: number): any {
  switch (subjectId) {
    case SUBJECT_IDS.MATHS:   return prisma.mathsQuestion;
    case SUBJECT_IDS.ENGLISH: return prisma.englishQuestion;
    case SUBJECT_IDS.VR:      return prisma.vRQuestion;
    case SUBJECT_IDS.NVR:     return prisma.nVRQuestion;
    default: throw new Error(`Invalid subjectId: ${subjectId}`);
  }
}

/**
 * Fetches a question by ID from the correct subject-specific table.
 */
export async function getQuestionById(questionId: number, subjectId: number): Promise<any> {
  const model = getQuestionModel(subjectId);
  return model.findUnique({
    where: { id: questionId },
    include: { syllabus: true },
  });
}

/**
 * Fetches multiple questions by their IDs from the correct subject-specific table.
 */
export async function getQuestionsByIds(questionIds: number[], subjectId: number): Promise<any[]> {
  const model = getQuestionModel(subjectId);
  return model.findMany({
    where: { id: { in: questionIds } },
    include: { syllabus: true },
  });
}

/**
 * Fetches all questions from a subject table matching the given filters.
 */
export async function findQuestions(subjectId: number, where: any = {}, include: any = {}): Promise<any[]> {
  const model = getQuestionModel(subjectId);
  return model.findMany({
    where: { ...where, isActive: true },
    include: { syllabus: true, ...include },
  });
}
