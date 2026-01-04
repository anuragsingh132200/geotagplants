import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UploadProgress, LocationData, ApiResponse } from '../types';

interface UploadState {
  uploads: UploadProgress[];
  isUploading: boolean;
  error: string | null;
}

const initialState: UploadState = {
  uploads: [],
  isUploading: false,
  error: null,
};

export const extractLocationData = createAsyncThunk(
  'upload/extractLocationData',
  async ({ emailId, imageName, imageUrl }: {
    emailId: string;
    imageName: string;
    imageUrl: string;
  }): Promise<LocationData> => {
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
  }
);

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    addUpload: (state, action: PayloadAction<UploadProgress>) => {
      state.uploads.push(action.payload);
    },
    updateUploadProgress: (state, action: PayloadAction<{
      fileName: string;
      progress: number;
      status: UploadProgress['status'];
      error?: string;
    }>) => {
      const upload = state.uploads.find(u => u.fileName === action.payload.fileName);
      if (upload) {
        upload.progress = action.payload.progress;
        upload.status = action.payload.status;
        if (action.payload.error) {
          upload.error = action.payload.error;
        }
      }
    },
    removeUpload: (state, action: PayloadAction<string>) => {
      state.uploads = state.uploads.filter(u => u.fileName !== action.payload);
    },
    clearCompletedUploads: (state) => {
      state.uploads = state.uploads.filter(u => u.status !== 'completed');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(extractLocationData.pending, (state) => {
        state.isUploading = true;
        state.error = null;
      })
      .addCase(extractLocationData.fulfilled, (state) => {
        state.isUploading = false;
      })
      .addCase(extractLocationData.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.error.message || 'Failed to extract location data';
      });
  },
});

export const {
  addUpload,
  updateUploadProgress,
  removeUpload,
  clearCompletedUploads,
  clearError,
} = uploadSlice.actions;

export default uploadSlice.reducer;
