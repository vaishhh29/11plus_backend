"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentMiddleware = void 0;
const studentMiddleware = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized. Login required.' });
        return;
    }
    if (req.user.role !== 'STUDENT') {
        res.status(403).json({ message: 'Access denied. Student privileges required.' });
        return;
    }
    next();
};
exports.studentMiddleware = studentMiddleware;
