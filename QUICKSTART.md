# Quick Start Guide

Get GeoTag Plants up and running in 5 minutes! ⚡

## Prerequisites

- Node.js 16+ installed ([Download](https://nodejs.org/))
- A Cloudinary account ([Sign up free](https://cloudinary.com/users/register/free))
- A code editor (VS Code recommended)
- Git installed

## Step 1: Get the Code (1 minute)

```bash
# Clone the repository
git clone <your-repo-url>
cd geotagplants

# Or if you already have the code
cd geotagplants
```

## Step 2: Install Dependencies (1 minute)

```bash
npm install
```

Wait for installation to complete. You'll see "added XXX packages" when done.

## Step 3: Configure Cloudinary (2 minutes)

### Create Cloudinary Account

1. Go to [cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up with email or Google
3. Verify your email

### Get Your Credentials

1. Log in to Cloudinary dashboard
2. Note your **Cloud Name** (visible at top of dashboard)
3. Go to **Settings** → **Upload**
4. Click **Add upload preset**
5. Configure preset:
   - **Preset name**: `geotagplants_preset` (or any name)
   - **Signing Mode**: Select **Unsigned**
   - Click **Save**
6. Note the preset name

### Set Up Environment Variables

1. Copy the example env file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file with your credentials:
   ```env
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
   VITE_CLOUDINARY_UPLOAD_PRESET=geotagplants_preset
   VITE_USER_EMAIL=your_email@example.com
   VITE_API_BASE_URL=https://api.alumnx.com/api/hackathons
   ```

   Replace:
   - `your_cloud_name_here` with your actual cloud name
   - `geotagplants_preset` with your preset name
   - `your_email@example.com` with your email

## Step 4: Start the App (1 minute)

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## Step 5: Test the App (2 minutes)

### Upload Your First Plant

1. **Get Sample Images**
   - Download from [this Google Drive folder](https://drive.google.com/drive/folders/15EMHWHvheZBU0wRfvj2uxQL01PhIB11D?usp=sharing)
   - Or use your own geo-tagged images

2. **Upload Process**
   - Drag and drop an image onto the upload zone
   - Or click to browse and select
   - Click "Upload 1 Image"
   - Wait for the success notification

3. **View on Map**
   - The plant should appear on the map
   - Click the marker to see details
   - Try zooming and panning

4. **Try List View**
   - Click "List View" toggle
   - See your plant in grid format
   - Try searching and sorting

### Batch Upload (Optional)

1. Select multiple images at once
2. Click "Upload X Images"
3. Watch progress bars for each image
4. All plants will appear on the map!

## Congratulations! 🎉

You now have a working GeoTag Plants application!

## What's Next?

### Customize Your App

1. **Change Theme Colors**
   - Edit `src/App.css`
   - Update color variables

2. **Add More Features**
   - Check `README.md` for feature ideas
   - Review `ARCHITECTURE.md` for structure

3. **Deploy to Production**
   - See `DEPLOYMENT.md` for detailed instructions
   - Recommended: Deploy to Vercel (it's free!)

### Learn More

- **README.md** - Complete feature list and documentation
- **ARCHITECTURE.md** - Technical architecture and design decisions
- **DEPLOYMENT.md** - Deployment guides for various platforms

## Common Issues

### Issue: "Missing environment variables" warning

**Fix**: Check your `.env` file has all required variables and restart the dev server.

### Issue: Upload fails

**Fixes**:
1. Verify Cloudinary cloud name is correct
2. Ensure upload preset is set to "Unsigned"
3. Check internet connection
4. Try with a different image

### Issue: Map doesn't show

**Fixes**:
1. Check browser console for errors
2. Ensure you've uploaded at least one plant
3. Verify internet connection (map tiles load from OpenStreetMap)
4. Try refreshing the page

### Issue: Port 3000 already in use

**Fix**: Stop other apps using port 3000, or change port in `vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001, // Change to any available port
  },
})
```

## Development Tips

### Hot Module Replacement (HMR)

Changes to your code will instantly reflect in the browser without full page reload!

- Edit any component → See changes immediately
- CSS changes → Instant update
- State is preserved during HMR

### Browser DevTools

- Press F12 to open developer tools
- Check Console tab for logs and errors
- Use Network tab to monitor API calls
- Redux DevTools extension recommended

### Recommended VS Code Extensions

```bash
# Install these for better DX:
- ESLint
- Prettier
- TypeScript Vue Plugin
- Tailwind CSS IntelliSense (optional)
```

## Quick Commands Reference

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Install new package
npm install package-name

# Update dependencies
npm update
```

## Sample Workflow

Here's a typical development session:

1. **Start the day**
   ```bash
   git pull origin main
   npm install  # If dependencies updated
   npm run dev
   ```

2. **Make changes**
   - Edit components
   - Test in browser
   - Check console for errors

3. **Before committing**
   ```bash
   npm run lint  # Check for issues
   npm run build  # Ensure it builds
   git add .
   git commit -m "Add feature X"
   git push
   ```

## Getting Help

- **Questions about code?** → Check `ARCHITECTURE.md`
- **Deployment issues?** → See `DEPLOYMENT.md`
- **Feature requests?** → Open an issue on GitHub
- **Bug reports?** → Email support@alumnx.com

## Resources

- [React Documentation](https://react.dev)
- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Leaflet Documentation](https://leafletjs.com/)

---

**Happy Coding! 🚀**

Need more detailed information? Check out the complete [README.md](README.md).
