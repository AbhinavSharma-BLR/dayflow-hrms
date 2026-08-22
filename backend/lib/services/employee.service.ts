import { employeeRepository } from '../repositories/employee.repository';
import { storageService } from './storage.service';
import { AppError } from '../errors';
import { UpdateOwnProfileInput, HrUpdateEmployeeInput } from '../validations/employee.schema';

export class EmployeeService {
  async getEmployeeById(id: string) {
    const employee = await employeeRepository.findById(id);
    if (!employee) {
      throw AppError.notFound('Employee profile not found');
    }
    return employee;
  }

  async getEmployeeByUserId(userId: string) {
    const employee = await employeeRepository.findByUserId(userId);
    if (!employee) {
      throw AppError.notFound('Employee profile not found');
    }
    return employee;
  }

  async updateOwnProfile(userId: string, input: UpdateOwnProfileInput) {
    const employee = await employeeRepository.findByUserId(userId);
    if (!employee) {
      throw AppError.notFound('Employee profile not found');
    }

    // Only allow updating permitted fields
    const updated = await employeeRepository.updateOwnProfile(employee.id, {
      phone: input.phone,
      address: input.address,
      city: input.city,
      state: input.state,
      country: input.country,
      postalCode: input.postalCode,
    });

    return updated;
  }

  async hrUpdateEmployee(targetEmployeeId: string, input: HrUpdateEmployeeInput) {
    const employee = await employeeRepository.findById(targetEmployeeId);
    if (!employee) {
      throw AppError.notFound('Employee profile not found');
    }

    const updated = await employeeRepository.hrUpdateEmployee(targetEmployeeId, {
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      address: input.address,
      city: input.city,
      state: input.state,
      country: input.country,
      postalCode: input.postalCode,
      department: input.department,
      designation: input.designation,
      dateOfJoining: input.dateOfJoining ? new Date(input.dateOfJoining) : undefined,
      isActive: input.isActive,
    });

    return updated;
  }

  async uploadProfilePicture(userId: string, file: File) {
    const employee = await employeeRepository.findByUserId(userId);
    if (!employee) {
      throw AppError.notFound('Employee profile not found');
    }

    const pictureUrl = await storageService.processProfilePicture(file);
    const updated = await employeeRepository.updateProfilePicture(employee.id, pictureUrl);

    return {
      profilePicture: updated.profilePicture,
    };
  }

  async deleteProfilePicture(userId: string) {
    const employee = await employeeRepository.findByUserId(userId);
    if (!employee) {
      throw AppError.notFound('Employee profile not found');
    }

    await employeeRepository.updateProfilePicture(employee.id, null);
    return { profilePicture: null };
  }
}

export const employeeService = new EmployeeService();
