import { AppError } from '../errors';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export class StorageService {
  async processProfilePicture(file: File): Promise<string> {
    if (!file) {
      throw AppError.badRequest('No file provided');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw AppError.badRequest('Invalid file type. Only JPEG, PNG, and WEBP images are allowed');
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw AppError.badRequest('File size exceeds 5MB limit');
    }

    // Convert file buffer to base64 Data URL for standalone zero-dependency image storage in Phase 2
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    return `data:${file.type};base64,${base64}`;
  }
}

export const storageService = new StorageService();
