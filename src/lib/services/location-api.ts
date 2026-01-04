import { LocationData, ApiResponse, Plant } from '../types';

export const extractLocationData = async (
  emailId: string,
  imageName: string,
  imageUrl: string
): Promise<LocationData> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/hackathons/extract-latitude-longitude`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailId,
        imageName,
        imageUrl,
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to extract location data');
  }

  const result: ApiResponse<LocationData> = await response.json();
  return result.data!;
};

export const savePlantLocationData = async (plantData: {
  emailId: string;
  imageName: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
}) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/hackathons/save-plant-location-data`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(plantData),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to save plant location data');
  }

  return response.json();
};

export const getPlantLocationData = async (emailId: string): Promise<Plant[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/hackathons/get-plant-location-data`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emailId }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch plant location data');
  }

  const result: ApiResponse<Plant[]> = await response.json();
  return result.data || [];
};
