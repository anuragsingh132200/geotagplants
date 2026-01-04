export const generateUploadedImageName = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  return `1_latitude_15.96963_longitude_79.27812_${timestamp}_${randomString}.${extension}`;
};

export const uploadImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'unsigned_upload'); // Use your configured unsigned preset

    fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.secure_url) {
          resolve(data.secure_url);
        } else {
          reject(new Error('Upload failed'));
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const uploadImageWithProgress = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    
    formData.append('file', file);
    formData.append('upload_preset', 'unsigned_upload'); // Use your configured unsigned preset

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = (event.loaded / event.total) * 100;
        onProgress(Math.round(progress));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        if (response.secure_url) {
          resolve(response.secure_url);
        } else {
          reject(new Error('Upload failed'));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open(
      'POST',
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`
    );
    xhr.send(formData);
  });
};
