import prisma from '../config/database';

/**
 * Generates a random 6-digit number string.
 */
const generateRandomNumberCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generates a unique Teacher Code in the format TCH-XXXXXX
 */
export const generateTeacherCode = async (): Promise<string> => {
  let isUnique = false;
  let code = '';

  while (!isUnique) {
    code = `TCH-${generateRandomNumberCode()}`;
    const existing = await prisma.teacherProfile.findUnique({
      where: { teacherCode: code },
    });
    if (!existing) {
      isUnique = true;
    }
  }

  return code;
};

/**
 * Generates a unique Student Code in the format STD-XXXXXX
 */
export const generateStudentCode = async (): Promise<string> => {
  let isUnique = false;
  let code = '';

  while (!isUnique) {
    code = `STD-${generateRandomNumberCode()}`;
    const existing = await prisma.studentProfile.findUnique({
      where: { studentCode: code },
    });
    if (!existing) {
      isUnique = true;
    }
  }

  return code;
};
