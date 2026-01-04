# GeoTag Plants - Farm Management System

A production-ready frontend application that helps farmers visualize their crop locations by uploading geo-tagged plant images and displaying them on an interactive farm map.

## 🌟 Features

### Phase 1: Image Upload & Processing
- **Drag-and-drop interface** for multiple image uploads
- **Support for JPG, PNG formats** with file validation
- **Real-time upload progress** tracking
- **Batch upload support** for multiple images
- **Error handling** with user-friendly messages

### Phase 2: Location Data Extraction
- **Automatic GPS extraction** from image metadata
- **API integration** with AlumnX location extraction service
- **Real-time processing** status updates

### Phase 3: Farm Visualization
- **Interactive map** with plant markers
- **Zoom and pan functionality** for detailed exploration
- **Plant information tooltips** on hover
- **Responsive design** for mobile and desktop
- **Grid-based visualization** with coordinate system

### Phase 4: Data Management
- **Plant inventory management** with search and filter
- **Delete functionality** for removing plants
- **Sort options** (date, name, location)
- **Real-time statistics** dashboard
- **Plant detail view** with image preview

## 🛠 Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Image Storage**: Cloudinary
- **Icons**: Lucide React
- **API Integration**: RESTful APIs

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+) and npm/yarn
- Cloudinary free tier account

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
   
   Configure the following variables in `.env.local`:
   ```env
   # Cloudinary Configuration
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # API Configuration
   NEXT_PUBLIC_API_BASE_URL=https://api.alumnx.com

   # User Email (for demo purposes)
   NEXT_PUBLIC_USER_EMAIL=farmer@example.com
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main application page
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── progress.tsx
│   ├── phases/            # Main feature components
│   │   ├── image-upload-panel.tsx
│   │   ├── map-visualization-panel.tsx
│   │   └── plant-list-panel.tsx
│   └── providers.tsx     # Redux provider wrapper
├── lib/
│   ├── services/          # API services
│   │   ├── cloudinary.ts
│   │   └── location-api.ts
│   ├── slices/            # Redux slices
│   │   ├── plantsSlice.ts
│   │   └── uploadSlice.ts
│   ├── store.ts           # Redux store configuration
│   ├── types.ts           # TypeScript type definitions
│   └── utils.ts           # Utility functions
```

## 🔧 Configuration

### Cloudinary Setup

1. **Sign up** at [Cloudinary](https://cloudinary.com/users/register/free)
2. **Get your credentials**: Cloud Name, API Key, and API Secret
3. **Configure upload preset** for unsigned uploads (default: `ml_default`)
4. **Add credentials** to your `.env.local` file

### API Integration

The application integrates with two main APIs:

1. **Location Extraction API**
   - Endpoint: `POST /api/hackathons/extract-latitude-longitude`
   - Extracts GPS coordinates from uploaded images

2. **Plant Data Management API**
   - Endpoint: `POST /api/hackathons/save-plant-location-data`
   - Saves and manages plant location data

## 🎯 Usage Guide

### Uploading Plant Images

1. Navigate to the **Upload** tab
2. **Drag and drop** images or click to browse
3. **Monitor progress** in real-time
4. **View extracted location data** automatically

### Viewing Farm Map

1. Switch to the **Farm Map** tab
2. **Interact with markers** to see plant details
3. **Use zoom controls** for detailed exploration
4. **Click on plants** to select and view details

### Managing Plant Inventory

1. Go to the **Plant List** tab
2. **Search** by name or coordinates
3. **Sort** by date, name, or location
4. **Delete** unwanted plants
5. **View statistics** in the sidebar

## 🎨 Design Features

- **Mobile-first responsive design**
- **Agricultural color palette** (greens, earth tones)
- **Intuitive navigation** with tabbed interface
- **Real-time feedback** with loading states
- **Accessible components** following ARIA standards
- **Smooth transitions** and micro-interactions

## 🔍 Error Handling

- **File validation** for type and size
- **Network error handling** with retry options
- **User-friendly error messages**
- **Graceful degradation** for API failures
- **Toast notifications** for user feedback

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Deploy automatically** on push to main branch

### Other Platforms

The application can be deployed to any platform supporting Next.js:
- Netlify
- GitHub Pages
- AWS Amplify
- DigitalOcean App Platform

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests** if applicable
5. **Submit a pull request**

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- **Email**: support@alumnx.com
- **Documentation**: Check inline code comments
- **Issues**: Create an issue in the repository

## 🔮 Future Enhancements

- **Offline support** with service workers
- **Real-time collaboration** for multiple farmers
- **Plant health indicators** with color coding
- **Historical timeline** view of farm changes
- **Export functionality** (CSV/JSON)
- **Dark mode** theme switching
- **Plant analytics** dashboard
- **AI-powered plant identification**
- **Geofencing** for farm boundaries

---

**Built with ❤️ for farmers and agricultural technology**
