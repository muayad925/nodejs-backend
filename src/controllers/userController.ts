// src/controllers/userController.ts
import type { Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";
import { UserService } from "../services/userService.js";
import { UserRepository } from "../repositories/userRepository.js";

const userRepo = new UserRepository();
const userService = new UserService(userRepo);

export class UserController {
  static async getAllUsers(req: any, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAll();
      logger.info(
        { actor: req.user?.id, count: users.length },
        "Fetched all users"
      );
      res.json(users);
    } catch (err) {
      logger.error({ err, actor: req.user?.id }, "Failed to fetch all users");
      next(err);
    }
  }

  static async getProfile(req: any, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id; // assuming the logged-in user
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await userService.getUserProfile(userId);
      logger.info({ userId }, "Fetched user profile");
      res.json(user);
    } catch (err) {
      logger.error(
        { err, userId: req.user?.id },
        "Failed to fetch user profile"
      );
      next(err);
    }
  }
}
