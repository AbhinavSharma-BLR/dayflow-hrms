import { prisma } from '../db/prisma';

export async function generateUniqueEmployeeId(
  firstName: string,
  lastName: string,
  joiningYear?: number
): Promise<string> {
  const companyCode = process.env.COMPANY_CODE || 'DAY';
  const year = joiningYear || new Date().getFullYear();

  // Extract first two letters of first and last names (fallback to 'XX' if short)
  const fnPrefix = (firstName.trim().slice(0, 2) || 'XX').toUpperCase().padEnd(2, 'X');
  const lnPrefix = (lastName.trim().slice(0, 2) || 'XX').toUpperCase().padEnd(2, 'X');

  // Count existing employees to determine serial sequence
  const count = await prisma.employee.count();

  let serial = count + 1;
  let candidateId = '';
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 20) {
    const serialStr = String(serial).padStart(4, '0');
    candidateId = `${companyCode}${fnPrefix}${lnPrefix}${year}${serialStr}`;

    const existing = await prisma.employee.findUnique({
      where: { employeeId: candidateId },
      select: { id: true },
    });

    if (!existing) {
      isUnique = true;
    } else {
      serial++;
      attempts++;
    }
  }

  if (!isUnique) {
    // Fallback timestamp suffix if sequential search collides repeatedly
    candidateId = `${companyCode}${fnPrefix}${lnPrefix}${year}${Date.now().toString().slice(-4)}`;
  }

  return candidateId;
}
