import type { Role, User } from "@prisma/client";
import { UserRepository } from "../repositories/userRepository.js";

export class UserService {
  private repo: UserRepository;

  constructor(repo: UserRepository) {
    this.repo = repo;
  }

  async getAll() {
    // Here we could add caching, pagination, etc.
    return this.repo.list();
  }

  async getUserProfile(id: string) {
    const user = await this.repo.findBySupabaseAuthId(id);
    if (!user) throw new Error("User not found");
    return user;
  }

  async createUser(data: {
    firstName: string;
    lastName: string;
    gender: string;
    email: string;
    age: number;
    password: string;
    role?: Role;
    supabaseAuthId: string;
  }) {
    return this.repo.create(data);
  }

  async updateUserProfile(id: string, data: Partial<User>) {
    return this.repo.update(id, data);
  }
}
