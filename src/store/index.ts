import { configureStore } from '@reduxjs/toolkit';
import plantsReducer from './slices/plantsSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    plants: plantsReducer,
    notification: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['plants/uploadPlantImage/pending'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
