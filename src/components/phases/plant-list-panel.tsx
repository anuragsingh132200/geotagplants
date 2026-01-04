'use client';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Trash2, Eye, Calendar, MapPin, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RootState, AppDispatch } from '@/lib/store';
import { deletePlant } from '@/lib/slices/plantsSlice';
import { Plant } from '@/lib/types';
import { formatCoordinates, formatDate } from '@/lib/utils';

interface PlantListPanelProps {
  onPlantSelect?: (plant: Plant) => void;
}

export default function PlantListPanel({ onPlantSelect }: PlantListPanelProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { plants, loading } = useSelector((state: RootState) => state.plants);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'location'>('date');

  // Filter plants based on search term
  const filteredPlants = plants.filter(plant =>
    plant.imageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plant.latitude.toString().includes(searchTerm) ||
    plant.longitude.toString().includes(searchTerm)
  );

  // Sort plants
  const sortedPlants = [...filteredPlants].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      case 'name':
        return a.imageName.localeCompare(b.imageName);
      case 'location':
        return a.latitude - b.latitude || a.longitude - b.longitude;
      default:
        return 0;
    }
  });

  const handleDeletePlant = async (plantId: string) => {
    if (window.confirm('Are you sure you want to delete this plant?')) {
      try {
        await dispatch(deletePlant(plantId)).unwrap();
      } catch (error) {
        console.error('Failed to delete plant:', error);
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Plant Inventory ({plants.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search plants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'location')}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="location">Sort by Location</option>
          </select>
        </div>

        {/* Plant List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading plants...</p>
          </div>
        ) : sortedPlants.length === 0 ? (
          <div className="text-center py-8">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'No plants found matching your search.' : 'No plants uploaded yet.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 max-h-96 overflow-y-auto">
            {sortedPlants.map((plant) => (
              <div
                key={plant.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-gray-900 truncate mb-2">
                      {plant.imageName}
                    </h3>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <MapPin className="h-3 w-3" />
                        <span>{formatCoordinates(plant.latitude, plant.longitude)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(plant.uploadedAt)}</span>
                      </div>
                    </div>

                    {/* Plant Image Thumbnail */}
                    <div className="mt-3">
                      <img
                        src={plant.imageUrl}
                        alt={plant.imageName}
                        className="h-16 w-16 object-cover rounded-md border"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-plant.png';
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPlantSelect?.(plant)}
                      className="p-2"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeletePlant(plant.id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {plants.length > 0 && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{plants.length}</div>
                <div className="text-xs text-gray-600">Total Plants</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {new Set(plants.map(p => Math.round(p.latitude))).size}
                </div>
                <div className="text-xs text-gray-600">Latitudes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(plants.map(p => Math.round(p.longitude))).size}
                </div>
                <div className="text-xs text-gray-600">Longitudes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {plants.filter(p => {
                    const uploadDate = new Date(p.uploadedAt);
                    const today = new Date();
                    return uploadDate.toDateString() === today.toDateString();
                  }).length}
                </div>
                <div className="text-xs text-gray-600">Today</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
