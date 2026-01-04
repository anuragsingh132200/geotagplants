import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ToastNotification } from '../../types';

interface NotificationState {
  notifications: ToastNotification[];
}

const initialState: NotificationState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<ToastNotification, 'id'>>) => {
      const notification: ToastNotification = {
        id: Date.now().toString() + Math.random(),
        ...action.payload,
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const { addNotification, removeNotification, clearAllNotifications } =
  notificationSlice.actions;

export default notificationSlice.reducer;
