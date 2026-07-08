"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateStudentCode = exports.generateTeacherCode = void 0;
const database_1 = __importDefault(require("../config/database"));
/**
 * Generates a random 6-digit number string.
 */
const generateRandomNumberCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
/**
 * Generates a unique Teacher Code in the format TCH-XXXXXX
 */
const generateTeacherCode = async () => {
    let isUnique = false;
    let code = '';
    while (!isUnique) {
        code = `TCH-${generateRandomNumberCode()}`;
        const existing = await database_1.default.teacherProfile.findUnique({
            where: { teacherCode: code },
        });
        if (!existing) {
            isUnique = true;
        }
    }
    return code;
};
exports.generateTeacherCode = generateTeacherCode;
/**
 * Generates a unique Student Code in the format STD-XXXXXX
 */
const generateStudentCode = async () => {
    let isUnique = false;
    let code = '';
    while (!isUnique) {
        code = `STD-${generateRandomNumberCode()}`;
        const existing = await database_1.default.studentProfile.findUnique({
            where: { studentCode: code },
        });
        if (!existing) {
            isUnique = true;
        }
    }
    return code;
};
exports.generateStudentCode = generateStudentCode;
