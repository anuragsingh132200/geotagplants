import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { format } from 'date-fns';
import { Plant } from '../../types';
import './FarmMap.css';

interface FarmMapProps {
  plants: Plant[];
  onDeletePlant: (id: string) => void;
}

// Custom plant marker icon
const plantIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const FarmMap: React.FC<FarmMapProps> = ({ plants, onDeletePlant }) => {
  // Calculate center and zoom based on plants
  const { center, zoom } = useMemo(() => {
    if (plants.length === 0) {
      return { center: [20.5937, 78.9629] as [number, number], zoom: 5 }; // India center
    }

    const latitudes = plants.map((p) => p.latitude);
    const longitudes = plants.map((p) => p.longitude);

    const avgLat = latitudes.reduce((a, b) => a + b, 0) / latitudes.length;
    const avgLon = longitudes.reduce((a, b) => a + b, 0) / longitudes.length;

    // Calculate appropriate zoom level based on spread
    const latSpread = Math.max(...latitudes) - Math.min(...latitudes);
    const lonSpread = Math.max(...longitudes) - Math.min(...longitudes);
    const maxSpread = Math.max(latSpread, lonSpread);

    let calculatedZoom = 13;
    if (maxSpread > 1) calculatedZoom = 8;
    else if (maxSpread > 0.1) calculatedZoom = 11;
    else if (maxSpread > 0.01) calculatedZoom = 13;
    else calculatedZoom = 15;

    return { center: [avgLat, avgLon] as [number, number], zoom: calculatedZoom };
  }, [plants]);

  if (plants.length === 0) {
    return (
      <div className="farm-map-empty">
        <p>No plants to display. Upload some images to get started!</p>
      </div>
    );
  }

  return (
    <div className="farm-map">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="leaflet-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {plants.map((plant) => (
          <Marker
            key={plant.id}
            position={[plant.latitude, plant.longitude]}
            icon={plantIcon}
          >
            <Popup>
              <div className="plant-popup">
                <img
                  src={plant.imageUrl}
                  alt={plant.imageName}
                  className="plant-popup-image"
                />
                <h3 className="plant-popup-title">{plant.imageName}</h3>
                <div className="plant-popup-info">
                  <p>
                    <strong>Latitude:</strong> {plant.latitude.toFixed(6)}
                  </p>
                  <p>
                    <strong>Longitude:</strong> {plant.longitude.toFixed(6)}
                  </p>
                  <p>
                    <strong>Uploaded:</strong>{' '}
                    {format(new Date(plant.uploadedAt), 'PPp')}
                  </p>
                </div>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => onDeletePlant(plant.id)}
                >
                  Delete Plant
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default FarmMap;
