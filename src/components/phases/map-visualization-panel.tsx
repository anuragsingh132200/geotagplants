'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { MapPin, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RootState } from '@/lib/store';
import { Plant } from '@/lib/types';
import { formatCoordinates, formatDate } from '@/lib/utils';

interface MapViewProps {
  onPlantSelect?: (plant: Plant) => void;
}

export default function MapVisualizationPanel({ onPlantSelect }: MapViewProps) {
  const { plants } = useSelector((state: RootState) => state.plants);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredPlant, setHoveredPlant] = useState<Plant | null>(null);

  // Calculate bounds for all plants
  const getBounds = () => {
    if (plants.length === 0) return null;
    
    const lats = plants.map(p => p.latitude);
    const lngs = plants.map(p => p.longitude);
    
    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
    };
  };

  // Convert lat/lng to canvas coordinates
  const latLngToCanvas = (lat: number, lng: number, bounds: NonNullable<ReturnType<typeof getBounds>>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const width = canvas.width;
    const height = canvas.height;
    const padding = 50;

    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * (width - 2 * padding) + padding;
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * (height - 2 * padding) + padding;

    return {
      x: x * zoom + offset.x,
      y: y * zoom + offset.y,
    };
  };

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth || 800;
        canvas.height = parent.clientHeight || 500;
      }
    };

    resizeCanvas();

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Draw the map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ensure canvas has dimensions
    if (canvas.width === 0 || canvas.height === 0) {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth || 800;
        canvas.height = parent.clientHeight || 500;
      }
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const bounds = getBounds();
    if (!bounds || plants.length === 0) {
      // Draw empty state
      ctx.fillStyle = '#9ca3af';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No plants to display', canvas.width / 2, canvas.height / 2);
      return;
    }

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = (canvas.width / 10) * i;
      const y = (canvas.height / 10) * i;
      
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw plants
    plants.forEach((plant) => {
      const pos = latLngToCanvas(plant.latitude, plant.longitude, bounds);
      
      // Draw marker
      ctx.fillStyle = plant === hoveredPlant ? '#dc2626' : '#16a34a';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 8 * zoom, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw marker outline
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw plant icon (simplified)
      ctx.fillStyle = '#ffffff';
      ctx.font = `${12 * zoom}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🌱', pos.x, pos.y);
    });

    // Draw coordinates for hovered plant
    if (hoveredPlant) {
      const pos = latLngToCanvas(hoveredPlant.latitude, hoveredPlant.longitude, bounds);
      
      // Draw tooltip background
      const text = formatCoordinates(hoveredPlant.latitude, hoveredPlant.longitude);
      ctx.font = '12px sans-serif';
      const textWidth = ctx.measureText(text).width;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(pos.x - textWidth / 2 - 8, pos.y - 35, textWidth + 16, 24);
      
      // Draw tooltip text
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(text, pos.x, pos.y - 23);
    }
  }, [plants, zoom, offset, hoveredPlant]);

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    } else {
      // Check if hovering over a plant
      const bounds = getBounds();
      if (bounds) {
        let foundPlant: Plant | null = null;
        
        for (const plant of plants) {
          const pos = latLngToCanvas(plant.latitude, plant.longitude, bounds);
          const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
          
          if (distance <= 8 * zoom) {
            foundPlant = plant;
            break;
          }
        }
        
        setHoveredPlant(foundPlant);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredPlant && onPlantSelect) {
      onPlantSelect(hoveredPlant);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Farm Map Visualization
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[500px] border rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleCanvasClick}
          />
          
          {hoveredPlant && (
            <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg max-w-xs">
              <h4 className="font-medium text-sm mb-2">{hoveredPlant.imageName}</h4>
              <p className="text-xs text-gray-600 mb-1">
                {formatCoordinates(hoveredPlant.latitude, hoveredPlant.longitude)}
              </p>
              <p className="text-xs text-gray-600">
                {formatDate(hoveredPlant.uploadedAt)}
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div>
            {plants.length} {plants.length === 1 ? 'plant' : 'plants'} displayed
          </div>
          <div>
            Zoom: {Math.round(zoom * 100)}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
