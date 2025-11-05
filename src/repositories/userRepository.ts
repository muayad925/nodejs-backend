import prisma from "../config/db.js";
import type { Role, User } from "@prisma/client";

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findBySupabaseAuthId(supabaseAuthId: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { supabaseAuthId } });
  }

  async create(data: {
    firstName: string;
    lastName: string;
    gender: string;
    email: string;
    age: number;
    role?: Role;
    supabaseAuthId: string;
  }) {
    return prisma.user.create({ data });
  }

  async update(id: string, data: Partial<User>) {
    return prisma.user.update({ where: { supabaseAuthId: id }, data });
  }

  async list(): Promise<User[]> {
    return prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  }
}
