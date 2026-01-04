import axios, { AxiosInstance } from 'axios';
import { ENV } from '../config/env';
import { LocationExtractionResponse, SavePlantResponse, Plant } from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: ENV.API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Add request interceptor for logging
    this.api.interceptors.request.use(
      (config) => {
        console.log('API Request:', config.method?.toUpperCase(), config.url);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  async extractLocationFromImage(
    imageName: string,
    imageUrl: string
  ): Promise<LocationExtractionResponse> {
    const response = await this.api.post<LocationExtractionResponse>(
      '/extract-latitude-longitude',
      {
        emailId: ENV.USER_EMAIL,
        imageName,
        imageUrl,
      }
    );
    return response.data;
  }

  async savePlantLocationData(plant: Omit<Plant, 'id' | 'uploadedAt' | 'createdAt' | 'updatedAt'>): Promise<SavePlantResponse> {
    const response = await this.api.post<SavePlantResponse>(
      '/save-plant-location-data',
      {
        emailId: plant.emailId,
        imageName: plant.imageName,
        imageUrl: plant.imageUrl,
        latitude: plant.latitude,
        longitude: plant.longitude,
      }
    );
    return response.data;
  }

  async deletePlantData(plantId: string): Promise<void> {
    // Note: The API spec doesn't include a delete endpoint,
    // so this is a placeholder for future implementation
    // or you can implement it using local storage only
    console.log('Delete plant:', plantId);
  }
}

export const apiService = new ApiService();
