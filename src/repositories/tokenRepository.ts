import prisma from '../config/db.js';

export class TokenRepository {
  async create(userId: number, token: string) {
    return prisma.refreshToken.create({
      data: { userId, token },
    });
  }

  async find(userId: number, token: string) {
    return prisma.refreshToken.findFirst({
      where: { userId, token },
    });
  }

  async delete(userId: number, token: string) {
    return prisma.refreshToken.deleteMany({
      where: { userId, token },
    });
  }

  async deleteAll(userId: number) {
    return prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}
