import { configureStore } from '@reduxjs/toolkit';
import plantsReducer from './slices/plantsSlice';
import uploadReducer from './slices/uploadSlice';

export const store = configureStore({
  reducer: {
    plants: plantsReducer,
    upload: uploadReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
