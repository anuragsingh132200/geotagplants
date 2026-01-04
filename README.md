# AgroTag - Farm Management System

A premium, production-ready farm management application that helps farmers visualize their crop locations by uploading geo-tagged plant images and displaying them on an interactive map.

## 🌟 Features

### 🗺️ Dynamic Farm Map
- **Interactive Leaflet Map**: Smooth zoom and pan functionality for detailed exploration.
- **Plant Markers**: Clickable markers with detailed information and previews.
- **Real-time Counter**: Quick view of total tagged plants on the farm.
- **Responsive Layout**: Mobile-first design for on-field usage.

### 📤 Smart Upload Wizard
- **Drag-and-Drop Interface**: Easily upload multiple plant images simultaneously.
- **Automatic GPS Extraction**: Smart extraction of latitude and longitude from plant photos.
- **Real-time Progress**: Visual tracking of batch uploads and processing status.
- **Validation**: Support for JPG/PNG formats with comprehensive error handling.

### 📋 Plant Inventory
- **Comprehensive List**: Search and filter your plant database.
- **Plant Statistics**: Real-time insights and dashboard overview.
- **Detail Views**: In-depth information for every tagged plant.
- **Direct Management**: Easy deletion and updating of plant records.

### ⚙️ Personalized Settings
- **App Configuration**: Customize your experience.
- **Profile Management**: Manage farmer details and preferences.

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI & Styling**: [Tailwind CSS 4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Mapping**: [Leaflet](https://leafletjs.com/) & [React Leaflet](https://react-leaflet.js.org/)
- **Media Storage**: [Cloudinary](https://cloudinary.com/)
- **Data Integration**: RESTful APIs with AlumnX integration

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Cloudinary account for photo storage

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd geotagplants
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Configure your Cloudinary credentials and API base URL in `.env.local`.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── inventory/         # Plant listing and search
│   ├── upload/            # Smart upload wizard
│   ├── settings/          # App configuration
│   ├── layout.tsx         # Global layout with AgroTag branding
│   └── page.tsx           # Interactive map view (Home)
├── components/
│   ├── ui/                # Shared design system components
│   ├── farm-map.tsx       # Core map implementation
│   ├── plant-card.tsx     # Reusable plant detail component
│   └── layout.tsx         # Main navigation (Sidebar & Bottom Nav)
├── lib/
│   ├── services/          # Cloudinary & Location API services
│   ├── slices/            # Redux global state management
│   └── store.ts           # Centralized data store
```

## 🎨 Design Philosophy

AgroTag is built with a **premium agricultural aesthetic**, featuring:
- **Agro-Green Palette**: Vibrant greens and earthy tones for a natural feel.
- **Micro-interactions**: Smooth transitions and hover effects for a delightful UX.
- **Glassmorphism**: Modern backdrop blurs and subtle borders.
- **Mobile-First**: Optimized for rugged tablets and handheld devices in the field.

## 📄 License

This project is licensed under the MIT License.

---

**Built for the future of smart agriculture.**
