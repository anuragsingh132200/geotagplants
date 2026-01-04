# GeoTag Plants - Farm Crop Location Management System

A production-ready React application that helps farmers visualize crop locations by uploading geo-tagged plant images and displaying them on an interactive farm map.

![Tech Stack](https://img.shields.io/badge/React-18.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![Redux](https://img.shields.io/badge/Redux_Toolkit-2.0-purple)
![Vite](https://img.shields.io/badge/Vite-5.0-yellow)

## Features

### Phase 1: Image Upload & Processing ✅
- **Drag-and-drop interface** with visual feedback
- **Multiple format support** (JPG, PNG)
- **Batch uploads** - Upload multiple images simultaneously
- **Real-time progress tracking** with progress bars
- **Cloudinary integration** for image storage
- **Comprehensive error handling** with user-friendly messages

### Phase 2: Location Data Extraction ✅
- **Automatic GPS extraction** from image metadata
- **API integration** with backend services
- **Intelligent error handling** and retry mechanisms
- **Data validation** for coordinate accuracy

### Phase 3: Farm Visualization ✅
- **Interactive Leaflet map** with zoom and pan
- **Smart clustering** - Auto-centers based on plant locations
- **Custom plant markers** with detailed popups
- **Image thumbnails** in map popups
- **Coordinate display** with 6-decimal precision
- **Responsive grid view** as an alternative to map
- **Filter and search** capabilities

### Phase 4: Data Management ✅
- **Local persistence** using localStorage
- **API synchronization** for data backup
- **Delete functionality** with confirmation
- **Sort options** by date, latitude, or longitude
- **Search filter** by plant name
- **Timestamp tracking** for all uploads

### Bonus Features ✅
- **Mobile-first responsive design**
- **Toast notifications** for all user actions
- **Dark mode ready** architecture
- **Cross-browser compatibility**
- **Performance optimized** with React.memo and useMemo
- **Accessibility** considerations (ARIA labels, keyboard navigation)

## Tech Stack

- **Frontend Framework**: React 18.2 with TypeScript
- **State Management**: Redux Toolkit 2.0
- **Build Tool**: Vite 5.0
- **Styling**: Pure CSS with CSS Modules approach
- **Mapping**: Leaflet + React-Leaflet
- **Image Storage**: Cloudinary
- **HTTP Client**: Axios
- **File Upload**: React-Dropzone
- **Icons**: Lucide React
- **Date Formatting**: date-fns

## Architecture

### Component Hierarchy

```
App
├── ToastContainer
│   └── Toast[]
├── ImageUpload
│   ├── Dropzone
│   └── FileList
├── FarmMap (Map View)
│   ├── MapContainer
│   ├── TileLayer
│   └── Marker[] with Popup
└── PlantList (List View)
    ├── SearchBox
    ├── SortControls
    └── PlantCard[]
```

### State Management Flow

```
User Action
    ↓
Component (Dispatch Action)
    ↓
Redux Thunk (Async Logic)
    ↓
├── Cloudinary Service (Upload Image)
├── API Service (Extract Location)
└── API Service (Save Plant Data)
    ↓
Redux Reducer (Update State)
    ↓
localStorage (Persist Data)
    ↓
React Components (Re-render)
```

### Directory Structure

```
geotagplants/
├── src/
│   ├── components/
│   │   ├── ImageUpload/
│   │   │   ├── ImageUpload.tsx
│   │   │   └── ImageUpload.css
│   │   ├── FarmMap/
│   │   │   ├── FarmMap.tsx
│   │   │   └── FarmMap.css
│   │   ├── PlantList/
│   │   │   ├── PlantList.tsx
│   │   │   └── PlantList.css
│   │   └── Toast/
│   │       ├── Toast.tsx
│   │       ├── Toast.css
│   │       ├── ToastContainer.tsx
│   │       └── ToastContainer.css
│   ├── store/
│   │   ├── index.ts
│   │   └── slices/
│   │       ├── plantsSlice.ts
│   │       └── notificationSlice.ts
│   ├── services/
│   │   ├── cloudinary.service.ts
│   │   └── api.service.ts
│   ├── hooks/
│   │   └── useAppDispatch.ts
│   ├── types/
│   │   └── index.ts
│   ├── config/
│   │   └── env.ts
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   └── index.css
├── public/
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 16+ and npm/yarn
- Git
- Cloudinary account (free tier)

### Cloudinary Setup

1. **Create Account**
   - Visit [Cloudinary Sign Up](https://cloudinary.com/users/register/free)
   - Complete the registration

2. **Get Credentials**
   - Go to Dashboard
   - Note your **Cloud Name**
   - Navigate to Settings → Upload
   - Create an **Upload Preset**:
     - Click "Add upload preset"
     - Set signing mode to "Unsigned"
     - Name it (e.g., "geotagplants_preset")
     - Save the preset name

3. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Fill in your Cloudinary credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd geotagplants
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your credentials:
   ```env
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   VITE_USER_EMAIL=your_email@example.com
   VITE_API_BASE_URL=https://api.alumnx.com/api/hackathons
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   Application will open at `http://localhost:3000`

5. **Build for production**
   ```bash
   npm run build
   ```

   Preview production build:
   ```bash
   npm run preview
   ```

## Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Add environment variables**
   - Go to Vercel dashboard
   - Project Settings → Environment Variables
   - Add all variables from `.env`

### Netlify

1. **Install Netlify CLI**
   ```bash
   npm i -g netlify-cli
   ```

2. **Build and deploy**
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

3. **Configure environment**
   - Site settings → Environment variables
   - Add all required variables

### GitHub Pages

1. **Update `vite.config.ts`**
   ```typescript
   export default defineConfig({
     plugins: [react()],
     base: '/geotagplants/',
   })
   ```

2. **Build and deploy**
   ```bash
   npm run build
   npx gh-pages -d dist
   ```

## API Integration

### Endpoints Used

#### 1. Extract Location Data
```typescript
POST https://api.alumnx.com/api/hackathons/extract-latitude-longitude
Content-Type: application/json

{
  "emailId": "user@example.com",
  "imageName": "plant_image.jpeg",
  "imageUrl": "https://cloudinary.com/..."
}

Response: {
  "success": true,
  "data": {
    "imageName": "plant_image.jpeg",
    "latitude": 15.96963,
    "longitude": 79.27812
  }
}
```

#### 2. Save Plant Data
```typescript
POST https://api.alumnx.com/api/hackathons/save-plant-location-data
Content-Type: application/json

{
  "emailId": "user@example.com",
  "imageName": "plant_image.jpeg",
  "imageUrl": "https://cloudinary.com/...",
  "latitude": 15.96963,
  "longitude": 79.27812
}

Response: {
  "success": true,
  "message": "Farmer plant location data updated successfully",
  "isUpdate": false,
  "data": { /* Plant object */ }
}
```

## Usage Guide

### Uploading Plants

1. **Select Images**
   - Drag and drop images onto the upload zone
   - Or click to browse and select files
   - Multiple images can be selected at once

2. **Review Selection**
   - Check the file list
   - Remove unwanted files by clicking the X icon
   - View upload progress for each file

3. **Upload**
   - Click "Upload X Image(s)" button
   - Wait for processing to complete
   - Success notification will appear

### Viewing Plants

1. **Map View**
   - Interactive map showing all plant locations
   - Click markers to view plant details
   - Zoom and pan to explore
   - Map auto-centers based on plant locations

2. **List View**
   - Grid layout of all plants
   - Search by plant name
   - Sort by date, latitude, or longitude
   - Toggle sort order (ascending/descending)

### Managing Plants

1. **Delete**
   - Click delete button on plant card or in map popup
   - Confirm deletion in dialog
   - Plant is removed from storage

2. **Search**
   - Type in search box to filter by name
   - Results update in real-time

3. **Sort**
   - Select sort criteria from dropdown
   - Click sort icon to toggle order

## Technical Decisions

### Why Redux Toolkit?

- **Simplified Redux logic** with less boilerplate
- **Built-in async handling** with createAsyncThunk
- **Immutable updates** with Immer
- **DevTools integration** for debugging
- **Type safety** with TypeScript

### Why Vite?

- **Lightning-fast HMR** for better DX
- **Optimized builds** with Rollup
- **Modern ESM** support
- **Better than CRA** for React projects
- **Smaller bundle sizes**

### Why Leaflet over Google Maps?

- **Open source** and free
- **No API key required**
- **Lightweight** (38KB gzipped)
- **Extensive plugin ecosystem**
- **Better performance** for large datasets

### Why localStorage?

- **Instant persistence** without network calls
- **Works offline**
- **Fast read/write** operations
- **Simple API**
- **Fallback** when API is unavailable

### Component Design Patterns

- **Container/Presentational** pattern for separation of concerns
- **Custom hooks** for reusable logic
- **CSS Modules** approach for style encapsulation
- **Controlled components** for form inputs
- **Error boundaries** ready architecture

## Challenges & Solutions

### Challenge 1: Async Upload with Progress Tracking

**Problem**: Cloudinary SDK didn't provide granular upload progress for batch uploads.

**Solution**:
- Implemented custom XMLHttpRequest wrapper
- Created progress tracking in Redux state
- Individual progress bars for each file
- Real-time UI updates during upload

### Challenge 2: Map Auto-Centering

**Problem**: Map should intelligently center based on plant distribution.

**Solution**:
- Calculate average coordinates from all plants
- Compute spread to determine appropriate zoom level
- Dynamic zoom based on geographic distribution
- Fallback to India center when no plants exist

### Challenge 3: Mobile Responsiveness

**Problem**: Complex layout with map and upload sections on small screens.

**Solution**:
- Mobile-first CSS approach
- Stack layout on small screens
- Touch-friendly buttons and controls
- Responsive map height adjustments
- Collapsible sections for better UX

### Challenge 4: Type Safety with Environment Variables

**Problem**: Vite environment variables not typed by default.

**Solution**:
- Created `vite-env.d.ts` with type definitions
- Validation function for required variables
- User-friendly warnings for missing config
- Centralized env configuration module

### Challenge 5: Data Persistence Reliability

**Problem**: Ensuring data isn't lost between sessions.

**Solution**:
- Dual persistence: localStorage + API
- Load from localStorage on app start
- Save to localStorage after each change
- API as source of truth for recovery
- Error handling for storage quota exceeded

## Performance Optimizations

- **Code splitting** with React.lazy (ready for implementation)
- **Memoization** with useMemo for expensive calculations
- **Debounced search** to reduce re-renders
- **Virtual scrolling** ready for large plant lists
- **Image lazy loading** on map markers
- **Optimized re-renders** with React.memo
- **Efficient state updates** with Redux Toolkit

## Browser Compatibility

Tested and working on:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile Chrome (Android)
- ✅ Mobile Safari (iOS)

## Future Enhancements

- [ ] PWA with offline support
- [ ] Export data as CSV/JSON
- [ ] Plant health tracking
- [ ] Multi-user collaboration
- [ ] Historical timeline view
- [ ] Analytics dashboard
- [ ] Plant identification API
- [ ] Geofencing for farm boundaries
- [ ] Dark mode toggle
- [ ] Image comparison (before/after)

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_CLOUDINARY_CLOUD_NAME` | Yes | Your Cloudinary cloud name | `my-cloud` |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Yes | Unsigned upload preset name | `geotagplants` |
| `VITE_USER_EMAIL` | Yes | Your email for API identification | `farmer@example.com` |
| `VITE_API_BASE_URL` | No | Backend API base URL | `https://api.alumnx.com/api/hackathons` |

## Troubleshooting

### Issue: Upload fails with CORS error

**Solution**: Ensure your Cloudinary upload preset is set to "Unsigned" mode.

### Issue: Map doesn't display

**Solution**:
- Check internet connection (map tiles load from OpenStreetMap)
- Verify Leaflet CSS is loaded in index.html
- Clear browser cache

### Issue: Environment variables not loading

**Solution**:
- Ensure `.env` file is in project root
- Restart development server after changing `.env`
- Verify variable names start with `VITE_`

### Issue: Images not appearing on map

**Solution**:
- Check browser console for errors
- Verify Cloudinary URLs are accessible
- Ensure GPS data exists in image EXIF

## Contributing

This is a hackathon project, but suggestions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - feel free to use this project for learning and development.

## Contact

For questions or support, email: support@alumnx.com

## Acknowledgments

- **FiduraAI** for the challenge opportunity
- **Cloudinary** for image storage
- **OpenStreetMap** for map tiles
- **Leaflet** for mapping library
- **Redux Team** for state management tools

---

**Built with ❤️ for farmers and agriculture innovation**
