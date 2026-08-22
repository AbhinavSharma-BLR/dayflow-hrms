import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../db/prisma';
import { userRepository } from '../repositories/user.repository';
import { employeeRepository } from '../repositories/employee.repository';
import { emailService } from './email.service';
import { generateUniqueEmployeeId } from './employee-id.service';
import { generateTemporaryPassword } from './password.service';
import { AppError } from '../errors';
import { Role } from '@prisma/client';
import { SignupInput } from '../validations/auth.schema';

const BCRYPT_SALT_ROUNDS = 12;
const TOKEN_EXPIRY_HOURS = 24;

export class AuthService {
  /**
   * User registration method.
   */
  async signup(input: SignupInput) {
    const emailNormalized = input.email.toLowerCase().trim();
    const existingEmail = await userRepository.findByEmail(emailNormalized);
    if (existingEmail) {
      throw AppError.conflict('An account with this email address already exists');
    }

    let finalEmpId = input.employeeId?.trim().toUpperCase();
    if (finalEmpId) {
      const existingEmpId = await employeeRepository.findByEmployeeId(finalEmpId);
      if (existingEmpId) {
        throw AppError.conflict('An employee with this Employee ID already exists');
      }
    } else {
      finalEmpId = await generateUniqueEmployeeId(input.firstName, input.lastName);
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: emailNormalized,
          passwordHash,
          role: input.role || Role.EMPLOYEE,
          emailVerified: true, // Pre-verify user for seamless login
          mustChangePassword: false,
          verificationToken,
          verificationExpiry,
        },
      });

      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          employeeId: finalEmpId,
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          email: emailNormalized,
          isActive: true,
        },
      });

      return { user, employee };
    });

    const verifyUrl = await emailService.sendVerificationEmail(result.user.email, verificationToken);

    return {
      userId: result.user.id,
      email: result.user.email,
      employeeId: result.employee.employeeId,
      verifyUrl,
    };
  }

  /**
   * Bootstraps the initial HR Admin user if no users exist in the system.
   */
  async bootstrapAdmin(emailInput?: string, passwordInput?: string) {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      throw AppError.forbidden('Initial bootstrap is closed. HR Admin account already exists in the system.');
    }

    const email = (emailInput || 'admin.hr@dayflow.com').toLowerCase().trim();
    const password = passwordInput || 'Admin123!';
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: Role.HR,
          emailVerified: true,
          mustChangePassword: false,
        },
      });

      const empId = await generateUniqueEmployeeId('Admin', 'HR', new Date().getFullYear());

      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          employeeId: empId,
          firstName: 'HR',
          lastName: 'Administrator',
          email,
          department: 'Human Resources',
          designation: 'HR Admin Manager',
          isActive: true,
        },
      });

      return { user, employee };
    });

    return {
      userId: result.user.id,
      email: result.user.email,
      employeeId: result.employee.employeeId,
      role: result.user.role,
      initialPasswordNotice: 'Initial HR Admin account created successfully.',
    };
  }

  /**
   * HR/Admin creates a new employee account with an auto-generated Employee ID and temporary password.
   */
  async createEmployeeByHR(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    department?: string;
    designation?: string;
    dateOfJoining?: Date;
  }) {
    const emailNormalized = data.email.toLowerCase().trim();
    const existingEmail = await userRepository.findByEmail(emailNormalized);
    if (existingEmail) {
      throw AppError.conflict('An account with this email address already exists');
    }

    const joiningYear = data.dateOfJoining ? new Date(data.dateOfJoining).getFullYear() : new Date().getFullYear();
    const autoEmployeeId = await generateUniqueEmployeeId(data.firstName, data.lastName, joiningYear);
    const tempPassword = generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(tempPassword, BCRYPT_SALT_ROUNDS);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: emailNormalized,
          passwordHash,
          role: Role.EMPLOYEE,
          emailVerified: true, // Accounts created by HR are pre-verified
          mustChangePassword: true, // Forces password change on first login
        },
      });

      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          employeeId: autoEmployeeId,
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: emailNormalized,
          phone: data.phone?.trim() || null,
          department: data.department?.trim() || 'General',
          designation: data.designation?.trim() || 'Staff Member',
          dateOfJoining: data.dateOfJoining || new Date(),
          isActive: true,
        },
      });

      return { user, employee };
    });

    const verifyUrl = await emailService.sendVerificationEmail(
      result.user.email,
      `temp-credentials:${autoEmployeeId}`
    );

    return {
      userId: result.user.id,
      email: result.user.email,
      employeeId: result.employee.employeeId,
      tempPassword,
      verifyUrl,
    };
  }

  /**
   * Allows an employee to change their temporary password on first login.
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User account not found');
    }

    const matches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matches) {
      throw AppError.badRequest('Current password is incorrect');
    }

    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      throw AppError.badRequest('New password must be at least 8 characters long and contain at least one uppercase letter and one number');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        mustChangePassword: false,
      },
    });

    return { success: true, message: 'Password changed successfully' };
  }

  async verifyEmail(token: string) {
    const user = await userRepository.findByVerificationToken(token);
    if (!user) {
      throw AppError.badRequest('Invalid or expired verification token');
    }

    if (user.verificationExpiry && user.verificationExpiry < new Date()) {
      throw AppError.badRequest('Verification token has expired. Please request a new verification email');
    }

    await userRepository.markEmailVerified(user.id);

    return {
      userId: user.id,
      email: user.email,
      verified: true,
    };
  }

  async resendVerification(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return { success: true };
    }

    if (user.emailVerified) {
      throw AppError.badRequest('This email address is already verified');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await userRepository.updateVerificationToken(user.id, verificationToken, verificationExpiry);
    const verifyUrl = await emailService.sendVerificationEmail(user.email, verificationToken);

    return {
      success: true,
      verifyUrl,
    };
  }

  async verifyCredentials(identifier: string, password: unknown) {
    if (!identifier || typeof password !== 'string') {
      throw AppError.unauthorized('Invalid email or password');
    }

    const user = await userRepository.findByEmailOrEmployeeId(identifier);
    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw AppError.unauthorized('Invalid email or password');
    }

    if (!user.emailVerified) {
      throw AppError.unauthorized('Please verify your email address before logging in');
    }

    const name = user.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user.email;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employee?.employeeId || user.employee?.id,
      name,
      mustChangePassword: user.mustChangePassword,
    };
  }
}

export const authService = new AuthService();
