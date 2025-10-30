import prisma from "../config/db.js";
import type { Role, User, Gender } from "@prisma/client";

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async create(data: {
    firstName: string;
    lastName: string;
    gender: Gender;
    email: string;
    password: string;
    role?: Role;
  }) {
    return prisma.user.create({ data });
  }

  async list(): Promise<User[]> {
    return prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  }
}
