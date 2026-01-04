// Location extraction API service (integrates with alumnx endpoint)
const LOCATION_API_ENDPOINT =
  process.env.NEXT_PUBLIC_LOCATION_API_ENDPOINT || "https://api.example.com/extract-location"

export async function extractLocationFromImage(
  imageUrl: string,
): Promise<{ latitude: number; longitude: number; confidence: number }> {
  try {
    const response = await fetch(LOCATION_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageUrl,
      }),
    })

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      confidence: data.confidence || 0.8,
    }
  } catch (error) {
    console.error("Location extraction error:", error)
    throw error
  }
}
