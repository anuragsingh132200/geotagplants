// Types for the farm mapping application
export interface GeoLocation {
  latitude: number
  longitude: number
  altitude?: number
  accuracy?: number
}

export interface PlantRecord {
  id: string
  imageUrl: string
  cloudinaryPublicId: string
  plantName: string
  species?: string
  location: GeoLocation
  confidence: number
  timestamp: Date
  notes?: string
  tags?: string[]
}

export interface LocationExtractionResult {
  latitude: number
  longitude: number
  confidence: number
  metadata?: Record<string, unknown>
}

export interface UploadProgressEvent {
  loaded: number
  total: number
  percentage: number
}
