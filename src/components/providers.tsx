'use client';

import { Provider } from 'react-redux';
import { store } from '@/lib/store';
import DataInitializer from './data-initializer';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <DataInitializer />
      {children}
    </Provider>
  );
}
