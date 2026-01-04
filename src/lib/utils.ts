import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCoordinates(latitude: number, longitude: number): string {
  return `${latitude.toFixed(6)}°, ${longitude.toFixed(6)}°`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateFileName(file: File): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = file.name.split('.').pop();
  return `${timestamp}_${randomString}.${extension}`;
}

export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Please upload JPG or PNG images only.',
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size too large. Please upload images smaller than 10MB.',
    };
  }

  return { isValid: true };
}
