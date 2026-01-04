export interface Plant {
  id: string;
  emailId: string;
  imageName: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  uploadedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

export interface LocationExtractionResponse {
  success: boolean;
  data: {
    imageName: string;
    latitude: number;
    longitude: number;
  };
}

export interface SavePlantResponse {
  success: boolean;
  message: string;
  isUpdate: boolean;
  data: Plant;
}

export interface FilterOptions {
  sortBy: 'date' | 'latitude' | 'longitude';
  sortOrder: 'asc' | 'desc';
  searchTerm: string;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}
