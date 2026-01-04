import { ENV } from '../config/env';

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
}

export class CloudinaryService {
  private cloudName: string;
  private uploadPreset: string;

  constructor() {
    this.cloudName = ENV.CLOUDINARY_CLOUD_NAME;
    this.uploadPreset = ENV.CLOUDINARY_UPLOAD_PRESET;
  }

  async uploadImage(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<CloudinaryUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`);
      xhr.send(formData);
    });
  }

  async uploadMultipleImages(
    files: File[],
    onProgress?: (fileName: string, progress: number) => void
  ): Promise<CloudinaryUploadResult[]> {
    const uploadPromises = files.map((file) =>
      this.uploadImage(file, (progress) => {
        if (onProgress) {
          onProgress(file.name, progress);
        }
      })
    );

    return Promise.all(uploadPromises);
  }
}

export const cloudinaryService = new CloudinaryService();
