import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Plant, FilterOptions } from '../../types';
import { apiService } from '../../services/api.service';
import { cloudinaryService } from '../../services/cloudinary.service';
import { ENV } from '../../config/env';

interface PlantsState {
  plants: Plant[];
  loading: boolean;
  error: string | null;
  filters: FilterOptions;
  uploadProgress: Record<string, number>;
}

const initialState: PlantsState = {
  plants: [],
  loading: false,
  error: null,
  filters: {
    sortBy: 'date',
    sortOrder: 'desc',
    searchTerm: '',
  },
  uploadProgress: {},
};

// Load plants from localStorage
const loadPlantsFromStorage = (): Plant[] => {
  try {
    const stored = localStorage.getItem('geotagplants_data');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading plants from storage:', error);
    return [];
  }
};

// Save plants to localStorage
const savePlantsToStorage = (plants: Plant[]) => {
  try {
    localStorage.setItem('geotagplants_data', JSON.stringify(plants));
  } catch (error) {
    console.error('Error saving plants to storage:', error);
  }
};

// Async thunk for uploading and processing a plant image
export const uploadPlantImage = createAsyncThunk(
  'plants/uploadPlantImage',
  async (file: File, { rejectWithValue, dispatch }) => {
    try {
      // Upload to Cloudinary
      dispatch(setUploadProgress({ fileName: file.name, progress: 0 }));

      const cloudinaryResult = await cloudinaryService.uploadImage(
        file,
        (progress) => {
          dispatch(setUploadProgress({ fileName: file.name, progress }));
        }
      );

      dispatch(setUploadProgress({ fileName: file.name, progress: 100 }));

      // Extract location data
      const locationData = await apiService.extractLocationFromImage(
        file.name,
        cloudinaryResult.secure_url
      );

      if (!locationData.success) {
        throw new Error('Failed to extract location data');
      }

      // Save plant data
      const plantData = {
        emailId: ENV.USER_EMAIL,
        imageName: file.name,
        imageUrl: cloudinaryResult.secure_url,
        latitude: locationData.data.latitude,
        longitude: locationData.data.longitude,
      };

      const saveResult = await apiService.savePlantLocationData(plantData);

      if (!saveResult.success) {
        throw new Error('Failed to save plant data');
      }

      dispatch(clearUploadProgress(file.name));
      return saveResult.data;
    } catch (error: any) {
      dispatch(clearUploadProgress(file.name));
      return rejectWithValue(error.message || 'Upload failed');
    }
  }
);

// Async thunk for batch upload
export const uploadMultiplePlantImages = createAsyncThunk(
  'plants/uploadMultiplePlantImages',
  async (files: File[], { dispatch }) => {
    const results = await Promise.allSettled(
      files.map((file) => dispatch(uploadPlantImage(file)).unwrap())
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return { successful, failed, total: files.length };
  }
);

const plantsSlice = createSlice({
  name: 'plants',
  initialState: {
    ...initialState,
    plants: loadPlantsFromStorage(),
  },
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<FilterOptions>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    deletePlant: (state, action: PayloadAction<string>) => {
      state.plants = state.plants.filter((plant) => plant.id !== action.payload);
      savePlantsToStorage(state.plants);
    },
    setUploadProgress: (
      state,
      action: PayloadAction<{ fileName: string; progress: number }>
    ) => {
      state.uploadProgress[action.payload.fileName] = action.payload.progress;
    },
    clearUploadProgress: (state, action: PayloadAction<string>) => {
      delete state.uploadProgress[action.payload];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload single plant image
      .addCase(uploadPlantImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadPlantImage.fulfilled, (state, action) => {
        state.loading = false;
        const existingIndex = state.plants.findIndex(
          (p) => p.id === action.payload.id
        );
        if (existingIndex >= 0) {
          state.plants[existingIndex] = action.payload;
        } else {
          state.plants.unshift(action.payload);
        }
        savePlantsToStorage(state.plants);
      })
      .addCase(uploadPlantImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Upload multiple plant images
      .addCase(uploadMultiplePlantImages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadMultiplePlantImages.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(uploadMultiplePlantImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Batch upload failed';
      });
  },
});

export const {
  setFilters,
  deletePlant,
  setUploadProgress,
  clearUploadProgress,
  clearError,
} = plantsSlice.actions;

export default plantsSlice.reducer;
