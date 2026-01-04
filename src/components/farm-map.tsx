'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Plant } from '@/lib/types';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Component to recenter map
function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);

    return null;
}

interface FarmMapProps {
    plants: Plant[];
    selectedPlant?: Plant | null;
}

export default function FarmMap({ plants, selectedPlant }: FarmMapProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Default to a central location or first plant
    const defaultCenter: [number, number] = [20.5937, 78.9629]; // India center

    const center: [number, number] = selectedPlant
        ? [selectedPlant.latitude, selectedPlant.longitude]
        : plants && plants.length > 0
            ? [plants[0].latitude, plants[0].longitude]
            : defaultCenter;

    if (!isMounted) {
        return (
            <div className="w-full h-full bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">Loading map...</p>
            </div>
        );
    }

    return (
        <MapContainer
            center={center}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapUpdater center={center} />

            {plants?.map((plant) => (
                <Marker key={plant.id} position={[plant.latitude, plant.longitude]}>
                    <Popup>
                        <div className="text-center p-2">
                            <img
                                src={plant.imageUrl}
                                alt={plant.imageName}
                                className="w-24 h-24 object-cover rounded-lg mb-2 mx-auto"
                                onError={(e) => {
                                    e.currentTarget.src = '/placeholder-plant.png';
                                }}
                            />
                            <p className="font-semibold text-sm">{plant.imageName}</p>
                            <p className="text-xs text-gray-500">
                                {plant.latitude.toFixed(6)}, {plant.longitude.toFixed(6)}
                            </p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
