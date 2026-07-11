"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUBJECT_IDS = void 0;
exports.resolveSubjectId = resolveSubjectId;
exports.resolveSubjectName = resolveSubjectName;
exports.getSyllabusModel = getSyllabusModel;
exports.getQuestionModel = getQuestionModel;
exports.getQuestionById = getQuestionById;
exports.getQuestionsByIds = getQuestionsByIds;
exports.findQuestions = findQuestions;
/**
 * Subject-specific table resolver utility.
 * Maps subjectId (1=Maths, 2=English, 3=VR, 4=NVR) to the correct
 * Prisma model delegate for both syllabus and question tables.
 */
const database_1 = __importDefault(require("../config/database"));
// Subject ID constants
exports.SUBJECT_IDS = {
    MATHS: 1,
    ENGLISH: 2,
    VR: 3,
    NVR: 4,
};
/**
 * Maps a subject name string to its canonical subject ID.
 */
function resolveSubjectId(name) {
    const lower = name.toLowerCase().trim();
    if (['math', 'maths', 'mathematics', 'numerical'].includes(lower))
        return exports.SUBJECT_IDS.MATHS;
    if (['english', 'literacy'].includes(lower))
        return exports.SUBJECT_IDS.ENGLISH;
    if (['verbal', 'verbal reasoning', 'vr'].includes(lower))
        return exports.SUBJECT_IDS.VR;
    if (['non-verbal', 'non-verbal reasoning', 'nvr', 'spatial'].includes(lower))
        return exports.SUBJECT_IDS.NVR;
    return exports.SUBJECT_IDS.MATHS; // fallback
}
/**
 * Maps a subject name string to the canonical DB name used in the subjects table.
 */
function resolveSubjectName(name) {
    const lower = name.toLowerCase().trim();
    if (['math', 'maths', 'mathematics'].includes(lower))
        return 'Maths';
    if (['english'].includes(lower))
        return 'English';
    if (['verbal', 'verbal reasoning', 'vr'].includes(lower))
        return 'Verbal Reasoning';
    if (['non-verbal', 'non-verbal reasoning', 'nvr'].includes(lower))
        return 'Non-Verbal Reasoning';
    return name;
}
/**
 * Returns the Prisma delegate for the syllabus table of a given subjectId.
 */
function getSyllabusModel(subjectId) {
    switch (subjectId) {
        case exports.SUBJECT_IDS.MATHS: return database_1.default.mathsSyllabus;
        case exports.SUBJECT_IDS.ENGLISH: return database_1.default.englishSyllabus;
        case exports.SUBJECT_IDS.VR: return database_1.default.vRSyllabus;
        case exports.SUBJECT_IDS.NVR: return database_1.default.nVRSyllabus;
        default: throw new Error(`Invalid subjectId: ${subjectId}`);
    }
}
/**
 * Returns the Prisma delegate for the question table of a given subjectId.
 */
function getQuestionModel(subjectId) {
    switch (subjectId) {
        case exports.SUBJECT_IDS.MATHS: return database_1.default.mathsQuestion;
        case exports.SUBJECT_IDS.ENGLISH: return database_1.default.englishQuestion;
        case exports.SUBJECT_IDS.VR: return database_1.default.vRQuestion;
        case exports.SUBJECT_IDS.NVR: return database_1.default.nVRQuestion;
        default: throw new Error(`Invalid subjectId: ${subjectId}`);
    }
}
/**
 * Fetches a question by ID from the correct subject-specific table.
 */
async function getQuestionById(questionId, subjectId) {
    const model = getQuestionModel(subjectId);
    return model.findUnique({
        where: { id: questionId },
        include: { syllabus: true },
    });
}
/**
 * Fetches multiple questions by their IDs from the correct subject-specific table.
 */
async function getQuestionsByIds(questionIds, subjectId) {
    const model = getQuestionModel(subjectId);
    return model.findMany({
        where: { id: { in: questionIds } },
        include: { syllabus: true },
    });
}
/**
 * Fetches all questions from a subject table matching the given filters.
 */
async function findQuestions(subjectId, where = {}, include = {}) {
    const model = getQuestionModel(subjectId);
    return model.findMany({
        where: { ...where, isActive: true },
        include: { syllabus: true, ...include },
    });
}
