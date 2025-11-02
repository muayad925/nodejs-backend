import type { Role, Gender } from "@prisma/client";
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

  async getUserProfile(id: number) {
    const user = await this.repo.findById(id);
    if (!user) throw new Error("User not found");
    return user;
  }

  async createUser(data: {
    firstName: string;
    lastName: string;
    gender: Gender;
    email: string;
    password: string;
    role?: Role;
    supabaseAuthId: string;
  }) {
    return this.repo.create(data);
  }
}
