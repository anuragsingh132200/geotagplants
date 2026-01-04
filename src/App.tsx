import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './hooks/useAppDispatch';
import { deletePlant } from './store/slices/plantsSlice';
import { addNotification } from './store/slices/notificationSlice';
import { validateEnv } from './config/env';
import ImageUpload from './components/ImageUpload/ImageUpload';
import FarmMap from './components/FarmMap/FarmMap';
import PlantList from './components/PlantList/PlantList';
import ToastContainer from './components/Toast/ToastContainer';
import { Leaf, Map, List } from 'lucide-react';
import './App.css';

type ViewMode = 'map' | 'list';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const plants = useAppSelector((state) => state.plants.plants);
  const [viewMode, setViewMode] = useState<ViewMode>('map');

  useEffect(() => {
    const errors = validateEnv();
    if (errors.length > 0) {
      dispatch(
        addNotification({
          type: 'warning',
          message: `Missing environment variables: ${errors.join(', ')}. Please configure your .env file.`,
          duration: 10000,
        })
      );
    }
  }, [dispatch]);

  const handleDeletePlant = (id: string) => {
    const plant = plants.find((p) => p.id === id);
    if (plant && window.confirm(`Delete "${plant.imageName}"?`)) {
      dispatch(deletePlant(id));
      dispatch(
        addNotification({
          type: 'success',
          message: 'Plant deleted successfully',
        })
      );
    }
  };

  return (
    <div className="app">
      <ToastContainer />

      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <Leaf size={32} />
            <h1>GeoTag Plants</h1>
          </div>
          <p className="tagline">Farm Crop Location Management System</p>
        </div>
      </header>

      <main className="app-main">
        <div className="main-container">
          <section className="upload-section">
            <ImageUpload />
          </section>

          <section className="view-section">
            <div className="view-header">
              <h2>Farm Visualization</h2>
              <div className="view-toggle">
                <button
                  className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
                  onClick={() => setViewMode('map')}
                >
                  <Map size={18} />
                  Map View
                </button>
                <button
                  className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List size={18} />
                  List View
                </button>
              </div>
            </div>

            <div className="view-content">
              {viewMode === 'map' ? (
                <FarmMap plants={plants} onDeletePlant={handleDeletePlant} />
              ) : (
                <PlantList />
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <p>
          Built with React, TypeScript, Redux & Cloudinary | {plants.length} plants tracked
        </p>
      </footer>
    </div>
  );
};

export default App;
