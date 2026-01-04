'use client';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Leaf, Upload, Map, List, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RootState } from '@/lib/store';
import { Plant } from '@/lib/types';
import ImageUploadPanel from '@/components/phases/image-upload-panel';
import MapVisualizationPanel from '@/components/phases/map-visualization-panel';
import PlantListPanel from '@/components/phases/plant-list-panel';

type ActiveTab = 'upload' | 'map' | 'list';

export default function Home() {
  const { plants } = useSelector((state: RootState) => state.plants);
  const [activeTab, setActiveTab] = useState<ActiveTab>('upload');
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);

  const handlePlantSelect = (plant: Plant) => {
    setSelectedPlant(plant);
    setActiveTab('map');
  };

  const tabs = [
    { id: 'upload' as ActiveTab, label: 'Upload', icon: Upload, component: ImageUploadPanel },
    { id: 'map' as ActiveTab, label: 'Farm Map', icon: Map, component: MapVisualizationPanel },
    { id: 'list' as ActiveTab, label: 'Plant List', icon: List, component: PlantListPanel },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">GeoTag Plants</h1>
                <p className="text-sm text-gray-500">Farm Management System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{plants.length}</span> plants uploaded
              </div>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Primary Content */}
          <div className="lg:col-span-2">
            {ActiveComponent && (
              <ActiveComponent
                {...(activeTab === 'map' && { onPlantSelect: handlePlantSelect })}
                {...(activeTab === 'list' && { onPlantSelect: handlePlantSelect })}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Plants</span>
                  <span className="font-medium">{plants.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Today's Uploads</span>
                  <span className="font-medium">
                    {plants.filter(p => {
                      const uploadDate = new Date(p.uploadedAt);
                      const today = new Date();
                      return uploadDate.toDateString() === today.toDateString();
                    }).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Unique Locations</span>
                  <span className="font-medium">
                    {new Set(plants.map(p => `${p.latitude.toFixed(2)},${p.longitude.toFixed(2)}`)).size}
                  </span>
                </div>
              </div>
            </div>

            {/* Selected Plant Details */}
            {selectedPlant && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Plant</h3>
                <div className="space-y-3">
                  <div>
                    <img
                      src={selectedPlant.imageUrl}
                      alt={selectedPlant.imageName}
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-plant.png';
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedPlant.imageName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedPlant.latitude.toFixed(6)}°, {selectedPlant.longitude.toFixed(6)}°
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(selectedPlant.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setSelectedPlant(null)}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            )}

            {/* Help Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>
              <ol className="space-y-2 text-sm text-blue-800">
                <li>1. Upload geo-tagged plant images using the Upload tab</li>
                <li>2. View plant locations on the interactive Farm Map</li>
                <li>3. Manage your plant inventory in the Plant List</li>
                <li>4. Click on any plant marker to see details</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
