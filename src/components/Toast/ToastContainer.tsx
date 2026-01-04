import React from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppDispatch';
import { removeNotification } from '../../store/slices/notificationSlice';
import Toast from './Toast';
import './ToastContainer.css';

const ToastContainer: React.FC = () => {
  const notifications = useAppSelector((state) => state.notification.notifications);
  const dispatch = useAppDispatch();

  const handleClose = (id: string) => {
    dispatch(removeNotification(id));
  };

  return (
    <div className="toast-container">
      {notifications.map((notification) => (
        <Toast key={notification.id} notification={notification} onClose={handleClose} />
      ))}
    </div>
  );
};

export default ToastContainer;
