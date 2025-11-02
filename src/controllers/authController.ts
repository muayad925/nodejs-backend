// import type { Request, Response } from "express";
// import { AuthService } from "../services/authService.js";
// import { Gender } from "@prisma/client";

// const authService = new AuthService();

// export const register = async (req: Request, res: Response) => {
//   try {
//     const { firstName, lastName, gender, email, password } = req.body;
//     const genderEnum =
//       gender?.toLowerCase() === "male" ? Gender.MALE : Gender.FEMALE;

//     const result = await authService.register(
//       firstName,
//       lastName,
//       genderEnum,
//       email,
//       password
//     );
//     res.status(201).json(result);
//   } catch (err: any) {
//     res.status(400).json({ message: err.message });
//   }
// };

// export const login = async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;
//     const result = await authService.login(email, password);
//     res.json(result);
//   } catch (err: any) {
//     res.status(401).json({ message: err.message });
//   }
// };

// export const refresh = async (req: Request, res: Response) => {
//   try {
//     const { refreshToken } = req.body;
//     const tokens = await authService.refresh(refreshToken);
//     res.json(tokens);
//   } catch (err: any) {
//     res.status(401).json({ message: err.message });
//   }
// };

// export const logout = async (req: Request, res: Response) => {
//   try {
//     const { refreshToken } = req.body;
//     const userId = (req as any).userId;
//     await authService.logout(userId, refreshToken);
//     res.status(204).end();
//   } catch (err: any) {
//     res.status(400).json({ message: err.message });
//   }
// };
