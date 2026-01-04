"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUploadPanel } from "@/components/phases/image-upload-panel"
import { PlantListPanel } from "@/components/phases/plant-list-panel"
import { MapVisualizationPanel } from "@/components/phases/map-visualization-panel"
import { Leaf } from "lucide-react"

export default function Home() {
  const [activeTab, setActiveTab] = useState("upload")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Leaf className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">FarmMap</h1>
          </div>
          <p className="text-muted-foreground">
            Geotagging and visualizing plants on your farm using AI-powered image analysis
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload & Extract</TabsTrigger>
            <TabsTrigger value="map">Farm Map</TabsTrigger>
            <TabsTrigger value="records">Plant Records</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-6">
            <ImageUploadPanel />
          </TabsContent>

          <TabsContent value="map" className="mt-6">
            <MapVisualizationPanel />
          </TabsContent>

          <TabsContent value="records" className="mt-6">
            <PlantListPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
