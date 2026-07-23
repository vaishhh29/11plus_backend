"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
class AuthController {
    /**
     * Log in a user and return their JWT token + user details + role-specific profile details.
     */
    static async login(req, res, next) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                res.status(400).json({ message: 'Username and password are required' });
                return;
            }
            const result = await authService_1.AuthService.login({ username, password });
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Retrieve the profile of the currently logged-in user.
     */
    static async getProfile(req, res, next) {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const user = await authService_1.AuthService.getUserProfile(req.user.userId);
            res.status(200).json(user);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Update the profile of the currently logged-in user.
     */
    static async updateProfile(req, res, next) {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const updatedUser = await authService_1.AuthService.updateUserProfile(req.user.userId, req.body);
            res.status(200).json({
                message: 'Profile successfully updated.',
                data: updatedUser,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
