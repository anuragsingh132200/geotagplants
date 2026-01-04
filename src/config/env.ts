export const ENV = {
  CLOUDINARY_CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
  USER_EMAIL: import.meta.env.VITE_USER_EMAIL || '',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.alumnx.com/api/hackathons',
};

export const validateEnv = (): string[] => {
  const errors: string[] = [];

  if (!ENV.CLOUDINARY_CLOUD_NAME) {
    errors.push('VITE_CLOUDINARY_CLOUD_NAME is not set');
  }
  if (!ENV.CLOUDINARY_UPLOAD_PRESET) {
    errors.push('VITE_CLOUDINARY_UPLOAD_PRESET is not set');
  }
  if (!ENV.USER_EMAIL) {
    errors.push('VITE_USER_EMAIL is not set');
  }

  return errors;
};
