"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = void 0;
const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized. Login required.' });
        return;
    }
    if (req.user.role !== 'ADMIN') {
        res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
        return;
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
