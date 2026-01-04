"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { uploadImageToCloudinary } from "@/lib/services/cloudinary"
import { extractLocationFromImage } from "@/lib/services/location-api"
import { savePlantRecord } from "@/lib/services/storage"
import type { PlantRecord } from "@/lib/types"
import { Upload, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react"

export function ImageUploadPanel() {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [extractedData, setExtractedData] = useState<any>(null)
  const [plantName, setPlantName] = useState("")
  const [plantSpecies, setPlantSpecies] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setError("")
    setSuccess(false)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select an image first")
      return
    }

    if (!plantName.trim()) {
      setError("Please enter a plant name")
      return
    }

    setIsLoading(true)
    setError("")
    setUploadProgress(0)

    try {
      // Phase 1: Upload image to Cloudinary
      const { url: imageUrl, publicId } = await uploadImageToCloudinary(selectedFile, (progress) => {
        setUploadProgress(progress.percentage)
      })

      // Phase 2: Extract location from image
      setUploadProgress(75)
      const locationData = await extractLocationFromImage(imageUrl)

      // Create plant record
      const plantRecord: PlantRecord = {
        id: `plant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        imageUrl,
        cloudinaryPublicId: publicId,
        plantName: plantName.trim(),
        species: plantSpecies.trim() || undefined,
        location: {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        },
        confidence: locationData.confidence,
        timestamp: new Date(),
        notes: notes.trim() || undefined,
      }

      // Phase 4: Save to storage
      savePlantRecord(plantRecord)
      setExtractedData(plantRecord)

      setUploadProgress(100)
      setSuccess(true)

      // Reset form
      setTimeout(() => {
        setSelectedFile(null)
        setPreviewUrl("")
        setPlantName("")
        setPlantSpecies("")
        setNotes("")
        setUploadProgress(0)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.")
      setUploadProgress(0)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setPreviewUrl("")
    setPlantName("")
    setPlantSpecies("")
    setNotes("")
    setError("")
    setSuccess(false)
    setExtractedData(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  if (extractedData && success) {
    return (
      <div className="space-y-4">
        <Alert className="border-green-200 bg-green-50 text-green-900">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Plant record created successfully! Location coordinates: {extractedData.location.latitude.toFixed(6)},{" "}
            {extractedData.location.longitude.toFixed(6)}
          </AlertDescription>
        </Alert>

        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <img
                src={extractedData.imageUrl || "/placeholder.svg"}
                alt={extractedData.plantName}
                className="w-full h-64 object-cover rounded-lg border border-border"
              />
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{extractedData.plantName}</h3>
                {extractedData.species && <p className="text-sm text-muted-foreground">{extractedData.species}</p>}
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Location:</span>
                  <p className="text-muted-foreground">
                    {extractedData.location.latitude.toFixed(6)}, {extractedData.location.longitude.toFixed(6)}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Confidence:</span>
                  <p className="text-muted-foreground">{(extractedData.confidence * 100).toFixed(1)}%</p>
                </div>
                {extractedData.notes && (
                  <div>
                    <span className="font-medium">Notes:</span>
                    <p className="text-muted-foreground">{extractedData.notes}</p>
                  </div>
                )}
              </div>
              <Button onClick={resetForm} className="w-full mt-4">
                Upload Another Image
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="space-y-6">
          {/* File Upload Area */}
          <div>
            <Label className="mb-3 block">Step 1: Upload Plant Image</Label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div onClick={() => fileInputRef.current?.click()} className="space-y-2">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="font-medium">Drag and drop your image here</p>
                  <p className="text-sm text-muted-foreground">or click to select a file</p>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="space-y-3">
              <div className="relative">
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg border border-border"
                />
                <button
                  onClick={() => setSelectedFile(null)}
                  className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-2 hover:bg-destructive/90"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Plant Information */}
          {selectedFile && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="plantName">Step 2: Plant Name *</Label>
                <Input
                  id="plantName"
                  placeholder="e.g., Tomato, Corn, Wheat"
                  value={plantName}
                  onChange={(e) => setPlantName(e.target.value)}
                  className="mt-2"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="plantSpecies">Plant Species (Optional)</Label>
                <Input
                  id="plantSpecies"
                  placeholder="e.g., Solanum lycopersicum"
                  value={plantSpecies}
                  onChange={(e) => setPlantSpecies(e.target.value)}
                  className="mt-2"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <textarea
                  id="notes"
                  placeholder="Add any additional notes about this plant..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full mt-2 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  rows={3}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <Alert className="border-destructive/50 bg-destructive/10 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Progress */}
          {isLoading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {uploadProgress < 75 ? "Uploading image..." : "Extracting location..."}
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Upload Button */}
          {selectedFile && (
            <Button onClick={handleUpload} disabled={!plantName.trim() || isLoading} className="w-full" size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Upload & Extract Location"
              )}
            </Button>
          )}
        </div>
      </Card>

      {/* Configuration Note */}
      <Alert className="border-blue-200 bg-blue-50 text-blue-900">
        <AlertDescription className="text-sm">
          Ensure your Cloudinary and Location API credentials are configured in your environment variables.
        </AlertDescription>
      </Alert>
    </div>
  )
}
