// Local storage service for plant records (Phase 4 - can be replaced with backend)
import type { PlantRecord } from "../types"

const STORAGE_KEY = "farm_plant_records"

export function getPlantRecords(): PlantRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error("Error reading plant records:", error)
    return []
  }
}

export function savePlantRecord(record: PlantRecord): void {
  try {
    const records = getPlantRecords()
    records.push(record)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch (error) {
    console.error("Error saving plant record:", error)
  }
}

export function updatePlantRecord(id: string, updates: Partial<PlantRecord>): void {
  try {
    const records = getPlantRecords()
    const index = records.findIndex((r) => r.id === id)
    if (index !== -1) {
      records[index] = { ...records[index], ...updates }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
    }
  } catch (error) {
    console.error("Error updating plant record:", error)
  }
}

export function deletePlantRecord(id: string): void {
  try {
    const records = getPlantRecords()
    const filtered = records.filter((r) => r.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error("Error deleting plant record:", error)
  }
}

export function exportPlantRecords(): string {
  const records = getPlantRecords()
  return JSON.stringify(records, null, 2)
}

export function exportPlantRecordsAsCSV(): string {
  const records = getPlantRecords()

  if (records.length === 0) {
    return "No records to export"
  }

  const headers = ["ID", "Plant Name", "Species", "Latitude", "Longitude", "Confidence", "Timestamp", "Notes"]
  const rows = records.map((r) => [
    r.id,
    r.plantName,
    r.species || "",
    r.location.latitude,
    r.location.longitude,
    r.confidence,
    new Date(r.timestamp).toISOString(),
    r.notes || "",
  ])

  const csv = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
  ].join("\n")

  return csv
}
