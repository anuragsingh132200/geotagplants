"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getPlantRecords, deletePlantRecord } from "@/lib/services/storage"
import type { PlantRecord } from "@/lib/types"
import { MapPin, Trash2, Info, ZoomIn, ZoomOut, Home } from "lucide-react"

export function MapVisualizationPanel() {
  const [plantRecords, setPlantRecords] = useState<PlantRecord[]>([])
  const [selectedMarker, setSelectedMarker] = useState<PlantRecord | null>(null)
  const [zoom, setZoom] = useState(6)
  const [bounds, setBounds] = useState({ minLat: 25, maxLat: 50, minLng: -130, maxLng: -65 })

  // Load plant records
  useEffect(() => {
    const records = getPlantRecords()
    setPlantRecords(records)

    // Calculate bounds from records
    if (records.length > 0) {
      const lats = records.map((r) => r.location.latitude)
      const lngs = records.map((r) => r.location.longitude)
      const minLat = Math.min(...lats)
      const maxLat = Math.max(...lats)
      const minLng = Math.min(...lngs)
      const maxLng = Math.max(...lngs)

      const padding = 2
      setBounds({
        minLat: minLat - padding,
        maxLat: maxLat + padding,
        minLng: minLng - padding,
        maxLng: maxLng + padding,
      })
    }
  }, [])

  const handleDeleteMarker = (id: string) => {
    deletePlantRecord(id)
    const records = getPlantRecords()
    setPlantRecords(records)
    setSelectedMarker(null)
  }

  // Convert lat/lng to SVG coordinates
  const latLngToSvg = (lat: number, lng: number): [number, number] => {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100
    const y = 100 - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100
    return [x, y]
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* SVG Map */}
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden">
            <div className="bg-gradient-to-br from-blue-50 to-green-50 relative">
              <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="w-full h-96 lg:h-full min-h-96">
                {/* Background grid */}
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />

                {/* Border */}
                <rect width="100" height="100" fill="none" stroke="#9ca3af" strokeWidth="0.5" />

                {/* Plant markers */}
                {plantRecords.map((record) => {
                  const [x, y] = latLngToSvg(record.location.latitude, record.location.longitude)
                  const isSelected = selectedMarker?.id === record.id
                  const confidenceColor =
                    record.confidence > 0.8
                      ? "#16a34a" // green
                      : record.confidence > 0.6
                        ? "#eab308" // yellow
                        : "#ef4444" // red

                  return (
                    <g key={record.id} onClick={() => setSelectedMarker(record)} style={{ cursor: "pointer" }}>
                      {/* Glow effect for selected */}
                      {isSelected && (
                        <circle cx={x} cy={y} r="3.5" fill="none" stroke="#3b82f6" strokeWidth="0.5" opacity="0.5" />
                      )}

                      {/* Main marker */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? "2.5" : "2"}
                        fill={confidenceColor}
                        stroke="white"
                        strokeWidth="0.3"
                      />

                      {/* Confidence indicator ring */}
                      <circle
                        cx={x}
                        cy={y}
                        r={2 + record.confidence}
                        fill="none"
                        stroke={confidenceColor}
                        strokeWidth="0.2"
                        opacity="0.3"
                      />
                    </g>
                  )
                })}

                {/* Coordinates labels */}
                <text x="2" y="4" fontSize="1.5" fill="#6b7280" fontFamily="monospace">
                  {bounds.maxLat.toFixed(1)}°N
                </text>
                <text x="2" y="97" fontSize="1.5" fill="#6b7280" fontFamily="monospace">
                  {bounds.minLat.toFixed(1)}°N
                </text>
                <text x="2" y="102" fontSize="1.5" fill="#6b7280" fontFamily="monospace">
                  {bounds.minLng.toFixed(1)}°W
                </text>
                <text x="85" y="102" fontSize="1.5" fill="#6b7280" fontFamily="monospace">
                  {bounds.maxLng.toFixed(1)}°W
                </text>
              </svg>

              {/* Map controls */}
              <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-white rounded-lg shadow-lg p-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setZoom(Math.min(zoom + 1, 12))}
                  className="h-8 w-8 p-0"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setZoom(Math.max(zoom - 1, 1))}
                  className="h-8 w-8 p-0"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setZoom(6)}
                  className="h-8 w-8 p-0"
                  title="Fit to bounds"
                >
                  <Home className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Marker Details */}
        <div className="space-y-4">
          {selectedMarker ? (
            <Card className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">{selectedMarker.plantName}</h3>
                {selectedMarker.species && (
                  <p className="text-sm text-muted-foreground mb-3">{selectedMarker.species}</p>
                )}

                <img
                  src={selectedMarker.imageUrl || "/placeholder.svg?height=160&width=240"}
                  alt={selectedMarker.plantName}
                  className="w-full h-40 object-cover rounded-lg border border-border mb-4"
                />

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Latitude:</span>
                    <p className="text-muted-foreground">{selectedMarker.location.latitude.toFixed(6)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Longitude:</span>
                    <p className="text-muted-foreground">{selectedMarker.location.longitude.toFixed(6)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Confidence:</span>
                    <p className="text-muted-foreground">{(selectedMarker.confidence * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <span className="font-medium">Recorded:</span>
                    <p className="text-muted-foreground">{new Date(selectedMarker.timestamp).toLocaleDateString()}</p>
                  </div>
                  {selectedMarker.notes && (
                    <div>
                      <span className="font-medium">Notes:</span>
                      <p className="text-muted-foreground">{selectedMarker.notes}</p>
                    </div>
                  )}
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => handleDeleteMarker(selectedMarker.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Record
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Info className="w-4 h-4" />
                <p className="text-sm">Click a marker to view details</p>
              </div>
            </Card>
          )}

          {/* Summary */}
          <Card className="p-4">
            <div className="text-sm space-y-2">
              <div className="font-semibold">Map Summary</div>
              <div>
                <span className="text-muted-foreground">Total Records: </span>
                <span className="font-medium">{plantRecords.length}</span>
              </div>
              {plantRecords.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Avg Confidence: </span>
                  <span className="font-medium">
                    {((plantRecords.reduce((sum, r) => sum + r.confidence, 0) / plantRecords.length) * 100).toFixed(1)}%
                  </span>
                </div>
              )}

              {/* Confidence legend */}
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <div className="font-semibold text-xs">Confidence Levels</div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-600" />
                  <span className="text-xs">&gt; 80%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="text-xs">60-80%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-xs">&lt; 60%</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {plantRecords.length === 0 && (
        <Alert>
          <MapPin className="h-4 w-4" />
          <AlertDescription>No plant records yet. Upload images to see them on the map.</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
