import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Plant, PlantFormData, ApiResponse } from '../types';

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

export const deletePlant = createAsyncThunk(
  'plants/deletePlant',
  async (plantId: string): Promise<string> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/hackathons/delete-plant/${plantId}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete plant');
    }

    return plantId;
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
      const index = state.plants.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.plants[index] = action.payload;
      }
    },
    removePlant: (state, action: PayloadAction<string>) => {
      state.plants = state.plants.filter(p => p.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(savePlantData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(savePlantData.fulfilled, (state, action) => {
        state.loading = false;
        const existingIndex = state.plants.findIndex(p => p.id === action.payload.id);
        if (existingIndex !== -1) {
          state.plants[existingIndex] = action.payload;
        } else {
          state.plants.push(action.payload);
        }
      })
      .addCase(savePlantData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to save plant data';
      })
      .addCase(deletePlant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePlant.fulfilled, (state, action) => {
        state.loading = false;
        state.plants = state.plants.filter(p => p.id !== action.payload);
      })
      .addCase(deletePlant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete plant';
      });
  },
});

export const { setSelectedPlant, clearError, addPlant, updatePlant, removePlant } = plantsSlice.actions;
export default plantsSlice.reducer;
