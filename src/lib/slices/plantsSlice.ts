import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Plant, PlantFormData, ApiResponse, getPlantId } from '../types';

interface PlantsState {
  plants: Plant[];
  loading: boolean;
  error: string | null;
  selectedPlant: Plant | null;
}

const initialState: PlantsState = {
  plants: [],
  loading: false,
  error: null,
  selectedPlant: null,
};

export const savePlantData = createAsyncThunk(
  'plants/savePlantData',
  async (plantData: PlantFormData): Promise<Plant> => {
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
      throw new Error('Failed to save plant data');
    }

    const result: ApiResponse<Plant> = await response.json();
    return result.data!;
  }
);

export const fetchPlantsData = createAsyncThunk(
  'plants/fetchPlantsData',
  async (emailId: string): Promise<Plant[]> => {
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
      if (response.status === 404) {
        // Handle case when no plants found for this email
        return [];
      }
      throw new Error('Failed to fetch plants data');
    }

    const result: ApiResponse<Plant[]> = await response.json();
    return result.data || [];
  }
);

const plantsSlice = createSlice({
  name: 'plants',
  initialState,
  reducers: {
    setSelectedPlant: (state, action: PayloadAction<Plant | null>) => {
      state.selectedPlant = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    addPlant: (state, action: PayloadAction<Plant>) => {
      state.plants.push(action.payload);
    },
    updatePlant: (state, action: PayloadAction<Plant>) => {
      const index = state.plants.findIndex(p => getPlantId(p) === getPlantId(action.payload));
      if (index !== -1) {
        state.plants[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlantsData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlantsData.fulfilled, (state, action) => {
        state.loading = false;
        state.plants = action.payload;
      })
      .addCase(fetchPlantsData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch plants data';
      })
      .addCase(savePlantData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(savePlantData.fulfilled, (state, action) => {
        state.loading = false;
        const existingIndex = state.plants.findIndex(p => getPlantId(p) === getPlantId(action.payload));
        if (existingIndex !== -1) {
          state.plants[existingIndex] = action.payload;
        } else {
          state.plants.push(action.payload);
        }
      })
      .addCase(savePlantData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to save plant data';
      });
  },
});

export const { setSelectedPlant, clearError, addPlant, updatePlant } = plantsSlice.actions;

export default plantsSlice.reducer;
