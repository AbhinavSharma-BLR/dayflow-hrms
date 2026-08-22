import { BaseRepository } from './base.repository';
import { Role } from '@prisma/client';

export class UserRepository extends BaseRepository {
  async findByEmail(email: string) {
    return this.db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { employee: true },
    });
  }

  async findByEmailOrEmployeeId(identifier: string) {
    const cleanId = identifier.trim();
    // 1. Try finding by email
    const byEmail = await this.db.user.findUnique({
      where: { email: cleanId.toLowerCase() },
      include: { employee: true },
    });
    if (byEmail) return byEmail;

    // 2. Try finding by employeeId
    const byEmp = await this.db.employee.findUnique({
      where: { employeeId: cleanId.toUpperCase() },
      include: { user: { include: { employee: true } } },
    });
    if (byEmp?.user) return byEmp.user;

    return null;
  }

  async findById(id: string) {
    return this.db.user.findUnique({
      where: { id },
      include: { employee: true },
    });
  }

  async findByVerificationToken(token: string) {
    return this.db.user.findFirst({
      where: { verificationToken: token },
      include: { employee: true },
    });
  }

  async createUser(data: {
    email: string;
    passwordHash: string;
    role: Role;
    verificationToken: string;
    verificationExpiry: Date;
  }) {
    return this.db.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        passwordHash: data.passwordHash,
        role: data.role,
        emailVerified: false,
        verificationToken: data.verificationToken,
        verificationExpiry: data.verificationExpiry,
      },
    });
  }

  async markEmailVerified(userId: string) {
    return this.db.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationExpiry: null,
      },
    });
  }

  async updateVerificationToken(userId: string, token: string, expiry: Date) {
    return this.db.user.update({
      where: { id: userId },
      data: {
        verificationToken: token,
        verificationExpiry: expiry,
      },
    });
  }
}

export const userRepository = new UserRepository();
