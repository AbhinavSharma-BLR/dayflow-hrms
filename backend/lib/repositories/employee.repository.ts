import { BaseRepository } from './base.repository';

export class EmployeeRepository extends BaseRepository {
  async findAll() {
    return this.db.employee.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, email: true, role: true, emailVerified: true, mustChangePassword: true } } },
    });
  }

  async findById(id: string) {
    return this.db.employee.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true, role: true, emailVerified: true, mustChangePassword: true } } },
    });
  }

  async findByUserId(userId: string) {
    return this.db.employee.findUnique({
      where: { userId },
      include: { user: { select: { id: true, email: true, role: true, emailVerified: true, mustChangePassword: true } } },
    });
  }

  async findByEmployeeId(employeeId: string) {
    return this.db.employee.findUnique({
      where: { employeeId: employeeId.trim().toUpperCase() },
    });
  }

  async createEmployee(data: {
    userId: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
  }) {
    return this.db.employee.create({
      data: {
        userId: data.userId,
        employeeId: data.employeeId.trim().toUpperCase(),
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.toLowerCase().trim(),
        isActive: true,
      },
    });
  }

  async updateOwnProfile(
    employeeId: string,
    data: {
      phone?: string | null;
      address?: string | null;
      city?: string | null;
      state?: string | null;
      country?: string | null;
      postalCode?: string | null;
    }
  ) {
    return this.db.employee.update({
      where: { id: employeeId },
      data,
    });
  }

  async hrUpdateEmployee(
    employeeId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string | null;
      address?: string | null;
      city?: string | null;
      state?: string | null;
      country?: string | null;
      postalCode?: string | null;
      department?: string | null;
      designation?: string | null;
      dateOfJoining?: Date | null;
      isActive?: boolean;
    }
  ) {
    return this.db.employee.update({
      where: { id: employeeId },
      data,
    });
  }

  async updateProfilePicture(employeeId: string, profilePicture: string | null) {
    return this.db.employee.update({
      where: { id: employeeId },
      data: { profilePicture },
    });
  }

  async countTotalEmployees() {
    return this.db.employee.count({
      where: { isActive: true },
    });
  }
}

export const employeeRepository = new EmployeeRepository();
