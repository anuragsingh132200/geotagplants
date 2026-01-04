# Architecture Documentation

## System Architecture Overview

GeoTag Plants follows a modern React application architecture with Redux for state management and a clean separation of concerns.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     React Application                    │
│                                                          │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ Components │  │ Redux Store  │  │ Services        │ │
│  │            │  │              │  │                 │ │
│  │ - Upload   │←→│ - Plants     │←→│ - Cloudinary   │ │
│  │ - Map      │  │ - Notify     │  │ - API Client   │ │
│  │ - List     │  │              │  │                 │ │
│  └────────────┘  └──────────────┘  └─────────────────┘ │
│         ↓                                      ↓         │
│  ┌────────────┐                       ┌─────────────┐  │
│  │   Hooks    │                       │ localStorage│  │
│  └────────────┘                       └─────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
        ┌─────────────────────────────────┐
        │     External Services            │
        │  - Cloudinary API                │
        │  - AlumnX Backend API            │
        │  - OpenStreetMap Tiles           │
        └─────────────────────────────────┘
```

## Component Architecture

### 1. App Component (Root)
**Responsibility**: Application shell and layout management

```typescript
App
├── Header (Logo, Title)
├── ToastContainer (Global notifications)
├── Main Content
│   ├── ImageUpload Section
│   └── Visualization Section
│       ├── View Toggle (Map/List)
│       └── Dynamic Content
│           ├── FarmMap (when map view)
│           └── PlantList (when list view)
└── Footer (Stats, Links)
```

**Key Features**:
- View mode state management (map/list toggle)
- Environment validation on mount
- Global error boundary (ready for implementation)

### 2. ImageUpload Component
**Responsibility**: File selection and upload orchestration

**Features**:
- Drag-and-drop zone with React-Dropzone
- File validation (type, size)
- Batch upload support
- Real-time progress tracking
- Upload status feedback

**Flow**:
```
User drops files
    ↓
Validate files (images only)
    ↓
Add to selected files state
    ↓
User clicks upload
    ↓
Dispatch uploadPlantImage/uploadMultiplePlantImages
    ↓
Show progress bars
    ↓
Clear on success/error
```

### 3. FarmMap Component
**Responsibility**: Interactive map visualization

**Features**:
- Leaflet integration with React-Leaflet
- Custom plant markers
- Interactive popups with plant details
- Auto-centering and zoom calculation
- Responsive map container

**Smart Centering Algorithm**:
```typescript
1. Calculate average latitude/longitude of all plants
2. Calculate geographic spread (max - min)
3. Determine zoom level:
   - spread > 1°    → zoom 8  (regional)
   - spread > 0.1°  → zoom 11 (district)
   - spread > 0.01° → zoom 13 (village)
   - else           → zoom 15 (farm)
4. Center map at average coordinates with calculated zoom
```

### 4. PlantList Component
**Responsibility**: Grid view with search and sort

**Features**:
- Responsive grid layout
- Real-time search filtering
- Multi-criteria sorting
- Card-based plant display
- Optimized re-renders with useMemo

**Filtering Logic**:
```typescript
plants
  → filter by searchTerm (case-insensitive)
  → sort by selected criteria (date/lat/lon)
  → apply sort order (asc/desc)
  → render cards
```

### 5. Toast System
**Responsibility**: User feedback and notifications

**Components**:
- `ToastContainer`: Renders notification stack
- `Toast`: Individual notification with auto-dismiss

**Features**:
- Type-based styling (success/error/warning/info)
- Auto-dismiss with configurable duration
- Manual dismiss option
- Stacked display for multiple notifications
- Smooth animations

## State Management

### Redux Store Structure

```typescript
{
  plants: {
    plants: Plant[],           // Array of plant objects
    loading: boolean,          // Global loading state
    error: string | null,      // Last error message
    filters: FilterOptions,    // Search and sort settings
    uploadProgress: {          // Upload progress by filename
      [fileName: string]: number
    }
  },
  notification: {
    notifications: ToastNotification[]  // Active notifications
  }
}
```

### Plants Slice

**State Shape**:
```typescript
interface PlantsState {
  plants: Plant[];
  loading: boolean;
  error: string | null;
  filters: FilterOptions;
  uploadProgress: Record<string, number>;
}
```

**Actions**:
- `uploadPlantImage` (async thunk)
- `uploadMultiplePlantImages` (async thunk)
- `setFilters` (sync)
- `deletePlant` (sync)
- `setUploadProgress` (sync)
- `clearUploadProgress` (sync)
- `clearError` (sync)

**Async Flow** (uploadPlantImage):
```
1. Dispatch pending → set loading=true
2. Upload to Cloudinary → track progress
3. Extract location from API
4. Save to backend API
5. Dispatch fulfilled → add plant to state
6. Save to localStorage
7. Clear loading state
```

### Notification Slice

**State Shape**:
```typescript
interface NotificationState {
  notifications: ToastNotification[];
}
```

**Actions**:
- `addNotification` - Add new toast
- `removeNotification` - Remove by ID
- `clearAllNotifications` - Clear all

## Service Layer

### 1. Cloudinary Service

**Purpose**: Handle image uploads to Cloudinary

**Methods**:
```typescript
class CloudinaryService {
  uploadImage(file, onProgress): Promise<CloudinaryUploadResult>
  uploadMultipleImages(files, onProgress): Promise<CloudinaryUploadResult[]>
}
```

**Implementation Details**:
- Uses XMLHttpRequest for progress tracking
- Unsigned uploads with preset
- Parallel batch uploads
- Error handling and retry logic

### 2. API Service

**Purpose**: Backend API communication

**Methods**:
```typescript
class ApiService {
  extractLocationFromImage(imageName, imageUrl): Promise<LocationExtractionResponse>
  savePlantLocationData(plant): Promise<SavePlantResponse>
  deletePlantData(plantId): Promise<void>  // Placeholder
}
```

**Features**:
- Axios-based HTTP client
- Request/response interceptors
- Centralized error handling
- Timeout configuration (30s)
- Automatic retry on network errors

## Data Flow

### Upload Flow (Detailed)

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │ Selects files
       ↓
┌─────────────────┐
│  ImageUpload    │
│  Component      │
└────────┬────────┘
         │ onClick Upload
         ↓
    Dispatch uploadPlantImage
         ↓
┌─────────────────────────────┐
│  Redux Thunk                │
│  (uploadPlantImage)         │
└─────────────────────────────┘
         │
         ├→ Update progress (0%)
         │
         ├→ CloudinaryService.uploadImage
         │      │
         │      ├→ Progress: 25%, 50%, 75%, 100%
         │      └→ Returns imageUrl
         │
         ├→ ApiService.extractLocationFromImage
         │      │
         │      └→ Returns lat/lon
         │
         ├→ ApiService.savePlantLocationData
         │      │
         │      └→ Returns saved plant object
         │
         └→ Dispatch fulfilled
                │
                ├→ Add plant to state.plants
                ├→ Save to localStorage
                └→ Show success notification
```

### Filter/Sort Flow

```
User types in search
    ↓
Dispatch setFilters({ searchTerm })
    ↓
Redux updates filters state
    ↓
PlantList re-renders
    ↓
useMemo recalculates filtered plants
    ↓
Only matching plants displayed
```

### Delete Flow

```
User clicks delete button
    ↓
Confirm dialog shown
    ↓
User confirms
    ↓
Dispatch deletePlant(id)
    ↓
Redux removes plant from array
    ↓
Save updated array to localStorage
    ↓
Show success notification
```

## Persistence Strategy

### localStorage Schema

**Key**: `geotagplants_data`

**Value**: JSON string of Plant array
```json
[
  {
    "id": "6789abcd1234ef5678901234",
    "emailId": "farmer@example.com",
    "imageName": "plant1.jpg",
    "imageUrl": "https://res.cloudinary.com/...",
    "latitude": 15.96963,
    "longitude": 79.27812,
    "uploadedAt": "2026-01-03T10:30:45.123Z"
  }
]
```

**Sync Strategy**:
1. Load from localStorage on app initialization
2. Save to localStorage after every state change
3. API calls for backup/recovery
4. localStorage is source of truth for UI

## Error Handling

### Levels of Error Handling

1. **Service Level**
   - Try/catch in service methods
   - Network error detection
   - Timeout handling

2. **Redux Level**
   - Async thunk rejection
   - Error state updates
   - Error action dispatching

3. **Component Level**
   - Error boundaries (ready)
   - Conditional rendering
   - User-friendly messages

4. **User Feedback**
   - Toast notifications
   - Inline error messages
   - Form validation feedback

### Error Recovery

```typescript
Upload Error
    ↓
Retry automatically (network errors)
    ↓
If still fails, show error notification
    ↓
Allow user to retry manually
    ↓
Maintain partial state (other uploads continue)
```

## Performance Considerations

### Optimization Techniques

1. **React Optimizations**
   - `useMemo` for expensive calculations (filtering, sorting)
   - `useCallback` for event handlers
   - `React.memo` for component memoization
   - Lazy loading (ready for code splitting)

2. **Redux Optimizations**
   - Normalized state structure
   - Selective re-renders with useSelector
   - Batched actions
   - Immer for immutable updates

3. **Network Optimizations**
   - Parallel uploads for batch
   - Request deduplication
   - Caching in service layer
   - Optimistic UI updates (ready)

4. **Rendering Optimizations**
   - Virtual scrolling (ready for large lists)
   - Image lazy loading
   - Debounced search input
   - Throttled scroll handlers

## Security Considerations

1. **Environment Variables**
   - Sensitive data in .env
   - Not committed to git
   - Validated on app start

2. **API Communication**
   - HTTPS only
   - Request timeouts
   - Input validation
   - XSS prevention (React escaping)

3. **File Upload**
   - Type validation
   - Size limits
   - Unsigned Cloudinary uploads (secure)

## Testing Strategy (Ready for Implementation)

### Unit Tests
- Redux reducers and actions
- Service layer methods
- Utility functions
- Custom hooks

### Integration Tests
- Redux thunks with mocked services
- Component interactions
- Form submissions

### E2E Tests
- Complete upload flow
- Map interactions
- Search and filter
- Data persistence

## Deployment Architecture

```
Source Code (GitHub)
    ↓
Build Process (Vite)
    ↓
Static Assets
    ↓
CDN/Hosting (Vercel/Netlify)
    ↓
User Browser
    ↓
External APIs (Cloudinary, AlumnX)
```

### Build Optimization
- Tree shaking
- Code splitting
- Minification
- Asset compression
- Cache busting with hashes

## Future Architecture Enhancements

1. **PWA Support**
   - Service worker for offline
   - Background sync
   - Push notifications

2. **Real-time Updates**
   - WebSocket integration
   - Multi-user collaboration
   - Optimistic UI updates

3. **Advanced State**
   - Redux persist
   - State rehydration
   - Time-travel debugging

4. **Micro-frontends**
   - Module federation
   - Independent deployments
   - Shared state

---

This architecture ensures scalability, maintainability, and excellent user experience while following React and Redux best practices.
