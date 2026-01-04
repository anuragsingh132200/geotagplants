export interface Plant {
  id?: string;
  _id?: string;
  emailId: string;
  imageName: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  uploadedAt: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  createdAt: string;
  updatedAt: string;
}

export function getPlantId(plant: Plant): string {
  return plant.id || plant._id || `plant-${plant.imageName}-${plant.latitude}-${plant.longitude}`;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface LocationData {
  imageName: string;
  latitude: number;
  longitude: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  isUpdate?: boolean;
  count?: number;
}

export interface PlantFormData {
  emailId: string;
  imageName: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
}
