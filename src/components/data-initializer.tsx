'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchPlantsData } from '@/lib/slices/plantsSlice';
import { AppDispatch } from '@/lib/store';

export default function DataInitializer() {
  const dispatch = useDispatch<AppDispatch>();
  
  useEffect(() => {
    // Fetch plants data when the app initializes
    const email = process.env.NEXT_PUBLIC_USER_EMAIL || 'anurag@gmail.com';
    dispatch(fetchPlantsData(email));
  }, [dispatch]);

  return null; // This component doesn't render anything
}
