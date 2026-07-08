"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teacherMiddleware = void 0;
const teacherMiddleware = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized. Login required.' });
        return;
    }
    if (req.user.role !== 'TEACHER') {
        res.status(403).json({ message: 'Access denied. Teacher privileges required.' });
        return;
    }
    next();
};
exports.teacherMiddleware = teacherMiddleware;
