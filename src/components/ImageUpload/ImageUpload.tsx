import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { uploadPlantImage, uploadMultiplePlantImages } from '../../store/slices/plantsSlice';
import { addNotification } from '../../store/slices/notificationSlice';
import './ImageUpload.css';

const ImageUpload: React.FC = () => {
  const dispatch = useAppDispatch();
  const uploadProgress = useAppSelector((state) => state.plants.uploadProgress);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const imageFiles = acceptedFiles.filter((file) =>
      file.type.startsWith('image/')
    );

    if (imageFiles.length !== acceptedFiles.length) {
      dispatch(
        addNotification({
          type: 'warning',
          message: 'Some files were not images and were filtered out',
        })
      );
    }

    setSelectedFiles((prev) => [...prev, ...imageFiles]);
  }, [dispatch]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    multiple: true,
  });

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      dispatch(
        addNotification({
          type: 'warning',
          message: 'Please select at least one image to upload',
        })
      );
      return;
    }

    try {
      if (selectedFiles.length === 1) {
        await dispatch(uploadPlantImage(selectedFiles[0])).unwrap();
        dispatch(
          addNotification({
            type: 'success',
            message: 'Plant image uploaded successfully!',
          })
        );
      } else {
        const result = await dispatch(uploadMultiplePlantImages(selectedFiles)).unwrap();
        dispatch(
          addNotification({
            type: 'success',
            message: `Uploaded ${result.successful} of ${result.total} images successfully`,
          })
        );
        if (result.failed > 0) {
          dispatch(
            addNotification({
              type: 'error',
              message: `${result.failed} image(s) failed to upload`,
            })
          );
        }
      }
      setSelectedFiles([]);
    } catch (error: any) {
      dispatch(
        addNotification({
          type: 'error',
          message: error || 'Failed to upload images',
        })
      );
    }
  };

  return (
    <div className="image-upload">
      <div className="upload-header">
        <h2>Upload Plant Images</h2>
        <p>Upload geo-tagged images of your plants to visualize them on the farm map</p>
      </div>

      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'dropzone-active' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload size={48} className="dropzone-icon" />
        <p className="dropzone-text">
          {isDragActive
            ? 'Drop the images here...'
            : 'Drag & drop plant images here, or click to select'}
        </p>
        <p className="dropzone-subtext">Supports JPG and PNG formats</p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="selected-files">
          <div className="selected-files-header">
            <h3>Selected Files ({selectedFiles.length})</h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setSelectedFiles([])}
            >
              Clear All
            </button>
          </div>
          <div className="file-list">
            {selectedFiles.map((file, index) => (
              <div key={index} className="file-item">
                <ImageIcon size={20} />
                <span className="file-name">{file.name}</span>
                <span className="file-size">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
                {uploadProgress[file.name] !== undefined && (
                  <div className="file-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${uploadProgress[file.name]}%` }}
                      />
                    </div>
                    <span className="progress-text">
                      {uploadProgress[file.name]}%
                    </span>
                  </div>
                )}
                {uploadProgress[file.name] === undefined && (
                  <button
                    className="btn-icon"
                    onClick={() => removeFile(index)}
                    title="Remove file"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={Object.keys(uploadProgress).length > 0}
          >
            {Object.keys(uploadProgress).length > 0
              ? 'Uploading...'
              : `Upload ${selectedFiles.length} Image${selectedFiles.length > 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
