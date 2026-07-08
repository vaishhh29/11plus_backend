"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionController = void 0;
const connectionService_1 = require("../services/connectionService");
class ConnectionController {
    static async joinTeacher(req, res, next) {
        try {
            const { teacherCode } = req.body;
            if (!req.user) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            if (!teacherCode) {
                res.status(400).json({ message: 'Teacher code is required.' });
                return;
            }
            const result = await connectionService_1.ConnectionService.joinTeacher(req.user.userId, teacherCode);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    static async linkChild(req, res, next) {
        try {
            const { studentCode } = req.body;
            if (!req.user) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            if (!studentCode) {
                res.status(400).json({ message: 'Student code is required.' });
                return;
            }
            const result = await connectionService_1.ConnectionService.linkChild(req.user.userId, studentCode);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    static async requestTeacher(req, res, next) {
        try {
            const { studentId, teacherId } = req.body;
            if (!req.user) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            if (!studentId || !teacherId) {
                res.status(400).json({ message: 'Student ID and Teacher ID are required.' });
                return;
            }
            const result = await connectionService_1.ConnectionService.requestTeacher(req.user.userId, studentId, teacherId);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    static async getPendingRequests(req, res, next) {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const result = await connectionService_1.ConnectionService.getPendingRequests(req.user.userId);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    static async respondToRequest(req, res, next) {
        try {
            const requestId = parseInt(req.params.id, 10);
            const { status } = req.body;
            if (!req.user) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            if (isNaN(requestId) || !status) {
                res.status(400).json({ message: 'Valid Request ID in URL and response status are required.' });
                return;
            }
            if (status !== 'ACCEPTED' && status !== 'REJECTED') {
                res.status(400).json({ message: "Status must be either 'ACCEPTED' or 'REJECTED'." });
                return;
            }
            const result = await connectionService_1.ConnectionService.respondToRequest(req.user.userId, requestId, status);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    static async getAllTeachers(req, res, next) {
        try {
            const result = await connectionService_1.ConnectionService.getAllTeachers();
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    static async getParentPendingRequests(req, res, next) {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const result = await connectionService_1.ConnectionService.getParentPendingRequests(req.user.userId);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ConnectionController = ConnectionController;
