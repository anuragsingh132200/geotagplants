'use client';

import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Upload, X, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AppDispatch, RootState } from '@/lib/store';
import { addUpload, updateUploadProgress } from '@/lib/slices/uploadSlice';
import { extractLocationData } from '@/lib/slices/uploadSlice';
import { savePlantData } from '@/lib/slices/plantsSlice';
import { uploadImageWithProgress } from '@/lib/services/cloudinary';
import { validateImageFile, generateFileName } from '@/lib/utils';
import { generateUploadedImageName } from '@/lib/services/cloudinary';
import { UploadProgress } from '@/lib/types';

export default function ImageUploadPanel() {
  const dispatch = useDispatch<AppDispatch>();
  const { uploads } = useSelector((state: RootState) => state.upload);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = useCallback(async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        console.error(validation.error);
        return false;
      }
      return true;
    });

    for (const file of validFiles) {
      const fileName = generateUploadedImageName(file.name);
      const uploadProgress: UploadProgress = {
        fileName,
        progress: 0,
        status: 'pending',
      };
      
      dispatch(addUpload(uploadProgress));

      try {
        // Update status to uploading
        dispatch(updateUploadProgress({
          fileName,
          progress: 0,
          status: 'uploading'
        }));

        // Upload to Cloudinary with progress tracking
        const imageUrl = await uploadImageWithProgress(file, (progress) => {
          dispatch(updateUploadProgress({
            fileName,
            progress,
            status: 'uploading'
          }));
        });

        // Update status to processing
        dispatch(updateUploadProgress({
          fileName,
          progress: 100,
          status: 'processing'
        }));

        // Extract location data
        const emailId = process.env.NEXT_PUBLIC_USER_EMAIL || 'demo@example.com';
        const locationData = await dispatch(extractLocationData({
          emailId,
          imageName: fileName,
          imageUrl
        })).unwrap();

        // Save plant data
        await dispatch(savePlantData({
          emailId,
          imageName: fileName,
          imageUrl,
          latitude: locationData.latitude,
          longitude: locationData.longitude
        })).unwrap();

        // Update status to completed
        dispatch(updateUploadProgress({
          fileName,
          progress: 100,
          status: 'completed'
        }));

      } catch (error) {
        dispatch(updateUploadProgress({
          fileName,
          progress: 0,
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed'
        }));
      }
    }
  }, [dispatch]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const getStatusIcon = (status: UploadProgress['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'uploading':
      case 'processing':
        return <Upload className="h-4 w-4 text-blue-500 animate-pulse" />;
      default:
        return <ImageIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: UploadProgress['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'uploading':
      case 'processing':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Plant Images
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Drop your plant images here
          </p>
          <p className="text-sm text-gray-500 mb-4">
            or click to browse from your computer
          </p>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileInputChange}
            className="hidden"
            id="file-upload"
          />
          <Button asChild variant="outline">
            <label htmlFor="file-upload" className="cursor-pointer">
              Select Images
            </label>
          </Button>
          <p className="text-xs text-gray-400 mt-4">
            Supported formats: JPG, PNG (Max 10MB per file)
          </p>
        </div>

        {uploads.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-700">Upload Progress</h4>
            {uploads.map((upload: UploadProgress) => (
              <div
                key={upload.fileName}
                className={`p-3 rounded-lg border ${getStatusColor(upload.status)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(upload.status)}
                    <span className="text-sm font-medium truncate max-w-[200px]">
                      {upload.fileName}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {upload.progress}%
                  </span>
                </div>
                {upload.status === 'uploading' && (
                  <Progress value={upload.progress} className="h-2" />
                )}
                {upload.error && (
                  <p className="text-xs text-red-600 mt-1">{upload.error}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
