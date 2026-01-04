"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getPlantRecords, deletePlantRecord, exportPlantRecords, exportPlantRecordsAsCSV } from "@/lib/services/storage"
import type { PlantRecord } from "@/lib/types"
import { Download, Trash2, Search, ArrowUpDown } from "lucide-react"

type SortField = "name" | "date" | "confidence"
type SortOrder = "asc" | "desc"

export function PlantListPanel() {
  const [plantRecords, setPlantRecords] = useState<PlantRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  useEffect(() => {
    loadRecords()
  }, [])

  const loadRecords = () => {
    const records = getPlantRecords()
    setPlantRecords(records)
  }

  const handleDeleteRecord = (id: string) => {
    if (confirm("Are you sure you want to delete this record?")) {
      deletePlantRecord(id)
      loadRecords()
    }
  }

  const handleExportJSON = () => {
    const json = exportPlantRecords()
    downloadFile(json, "plant-records.json", "application/json")
  }

  const handleExportCSV = () => {
    const csv = exportPlantRecordsAsCSV()
    downloadFile(csv, "plant-records.csv", "text/csv")
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Filter records
  const filteredRecords = plantRecords.filter(
    (record) =>
      record.plantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.species?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false),
  )

  // Sort records
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sortField) {
      case "name":
        aValue = a.plantName
        bValue = b.plantName
        break
      case "confidence":
        aValue = a.confidence
        bValue = b.confidence
        break
      case "date":
      default:
        aValue = new Date(a.timestamp).getTime()
        bValue = new Date(b.timestamp).getTime()
    }

    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    return sortOrder === "asc" ? comparison : -comparison
  })

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by plant name or species..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
            <div className="flex gap-2 items-center">
              <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="confidence">Sort by Confidence</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="gap-2"
              >
                <ArrowUpDown className="w-4 h-4" />
                {sortOrder === "asc" ? "Asc" : "Desc"}
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportJSON}
                disabled={plantRecords.length === 0}
                className="gap-2 bg-transparent"
              >
                <Download className="w-4 h-4" />
                Export JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={plantRecords.length === 0}
                className="gap-2 bg-transparent"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Table */}
      {sortedRecords.length > 0 ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plant Name</TableHead>
                  <TableHead>Species</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.plantName}</TableCell>
                    <TableCell>{record.species || "-"}</TableCell>
                    <TableCell className="text-xs">
                      {record.location.latitude.toFixed(4)}, {record.location.longitude.toFixed(4)}
                    </TableCell>
                    <TableCell>{(record.confidence * 100).toFixed(1)}%</TableCell>
                    <TableCell>{new Date(record.timestamp).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRecord(record.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : (
        <Alert>
          <AlertDescription>
            {searchTerm ? "No records match your search." : "No plant records yet. Upload images to get started."}
          </AlertDescription>
        </Alert>
      )}

      {/* Summary */}
      {plantRecords.length > 0 && (
        <Card className="p-4 bg-accent/10">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{plantRecords.length}</div>
              <div className="text-sm text-muted-foreground">Total Records</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {((plantRecords.reduce((sum, r) => sum + r.confidence, 0) / plantRecords.length) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Confidence</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {new Set(plantRecords.map((r) => r.plantName)).size}
              </div>
              <div className="text-sm text-muted-foreground">Unique Species</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
