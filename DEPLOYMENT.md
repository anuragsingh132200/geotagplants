# Deployment Guide

This guide covers deploying the GeoTag Plants application to various hosting platforms.

## Prerequisites

Before deploying, ensure you have:
- ✅ Completed the local setup
- ✅ Created a Cloudinary account
- ✅ Tested the application locally
- ✅ Committed your code to Git

## Deployment Options

### Option 1: Vercel (Recommended) ⭐

Vercel provides the best developer experience for React applications with automatic deployments and edge network.

#### Steps:

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

   Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? **geotagplants** (or your choice)
   - In which directory? **./** (current directory)
   - Override settings? **N**

4. **Configure Environment Variables**

   Via CLI:
   ```bash
   vercel env add VITE_CLOUDINARY_CLOUD_NAME
   vercel env add VITE_CLOUDINARY_UPLOAD_PRESET
   vercel env add VITE_USER_EMAIL
   vercel env add VITE_API_BASE_URL
   ```

   Or via Dashboard:
   - Go to your project on vercel.com
   - Settings → Environment Variables
   - Add each variable for Production, Preview, and Development

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

6. **Set up Git Integration (Optional but Recommended)**
   - Push your code to GitHub
   - Import project in Vercel dashboard
   - Connect to your repository
   - Configure environment variables
   - Vercel will auto-deploy on every push!

#### Custom Domain (Optional)

1. Go to your project on vercel.com
2. Settings → Domains
3. Add your custom domain
4. Follow DNS configuration instructions

---

### Option 2: Netlify

Netlify offers great features including form handling and serverless functions.

#### Steps:

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login**
   ```bash
   netlify login
   ```

3. **Build the Project**
   ```bash
   npm run build
   ```

4. **Deploy**
   ```bash
   netlify deploy
   ```

   Follow the prompts:
   - Create & configure a new site
   - Team: Select your team
   - Site name: **geotagplants** (or your choice)
   - Publish directory: **dist**

5. **Deploy to Production**
   ```bash
   netlify deploy --prod
   ```

6. **Configure Environment Variables**

   Via CLI:
   ```bash
   netlify env:set VITE_CLOUDINARY_CLOUD_NAME "your_value"
   netlify env:set VITE_CLOUDINARY_UPLOAD_PRESET "your_value"
   netlify env:set VITE_USER_EMAIL "your_value"
   netlify env:set VITE_API_BASE_URL "https://api.alumnx.com/api/hackathons"
   ```

   Or via Dashboard:
   - Site settings → Environment variables
   - Add each variable

7. **Set up Git Integration (Recommended)**
   ```bash
   netlify init
   ```
   - Connect to your Git repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Netlify will auto-deploy on push!

#### netlify.toml Configuration

Create a `netlify.toml` file in your project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

---

### Option 3: GitHub Pages

GitHub Pages is free and integrated with your repository.

#### Steps:

1. **Update vite.config.ts**

   Add the base path (replace `geotagplants` with your repo name):
   ```typescript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     base: '/geotagplants/',
   })
   ```

2. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Update package.json**

   Add these scripts:
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

5. **Configure GitHub Pages**
   - Go to your repo on GitHub
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages`
   - Folder: `/ (root)`
   - Save

6. **Add Environment Variables**

   GitHub Pages doesn't support server-side environment variables. You have two options:

   **Option A: Create a `.env.production` file** (Not recommended for sensitive data)
   ```bash
   VITE_CLOUDINARY_CLOUD_NAME=your_value
   VITE_CLOUDINARY_UPLOAD_PRESET=your_value
   VITE_USER_EMAIL=your_value
   VITE_API_BASE_URL=https://api.alumnx.com/api/hackathons
   ```

   **Option B: Use GitHub Secrets with Actions**
   - Settings → Secrets and variables → Actions
   - Add repository secrets
   - Create a GitHub Action workflow (see below)

#### GitHub Actions Workflow (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        env:
          VITE_CLOUDINARY_CLOUD_NAME: ${{ secrets.VITE_CLOUDINARY_CLOUD_NAME }}
          VITE_CLOUDINARY_UPLOAD_PRESET: ${{ secrets.VITE_CLOUDINARY_UPLOAD_PRESET }}
          VITE_USER_EMAIL: ${{ secrets.VITE_USER_EMAIL }}
          VITE_API_BASE_URL: https://api.alumnx.com/api/hackathons
        run: npm run build

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

### Option 4: Firebase Hosting

Firebase provides fast global CDN and easy deployment.

#### Steps:

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase**
   ```bash
   firebase init hosting
   ```

   Configuration:
   - Use existing project or create new
   - Public directory: **dist**
   - Single-page app: **Yes**
   - GitHub auto-deploy: **No** (or Yes if you want)

4. **Build the Project**
   ```bash
   npm run build
   ```

5. **Deploy**
   ```bash
   firebase deploy
   ```

6. **Environment Variables**

   Create `.env.production`:
   ```bash
   VITE_CLOUDINARY_CLOUD_NAME=your_value
   VITE_CLOUDINARY_UPLOAD_PRESET=your_value
   VITE_USER_EMAIL=your_value
   VITE_API_BASE_URL=https://api.alumnx.com/api/hackathons
   ```

---

## Environment Variables Reference

All platforms require these environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_CLOUDINARY_CLOUD_NAME` | Yes | Your Cloudinary cloud name |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Yes | Unsigned upload preset |
| `VITE_USER_EMAIL` | Yes | Your email for API |
| `VITE_API_BASE_URL` | No | API base URL (has default) |

## Post-Deployment Checklist

After deploying, verify:

- [ ] Application loads correctly
- [ ] Environment variables are set
- [ ] Image upload works
- [ ] Map displays properly
- [ ] Data persists in localStorage
- [ ] Mobile responsiveness
- [ ] Toast notifications appear
- [ ] Search and filter work
- [ ] Delete functionality works

## Troubleshooting

### Issue: Blank page after deployment

**Solution**:
- Check browser console for errors
- Verify environment variables are set
- Check if base URL is configured correctly (for GitHub Pages)
- Ensure build completed successfully

### Issue: Map doesn't load

**Solution**:
- Check network tab for failed requests
- Verify Leaflet CSS is loaded
- Check for CORS errors with OpenStreetMap

### Issue: Upload fails

**Solution**:
- Verify Cloudinary credentials
- Check upload preset is set to "unsigned"
- Ensure CORS is enabled in Cloudinary

### Issue: Environment variables not working

**Solution**:
- Variable names must start with `VITE_`
- Restart build after changing variables
- Verify variables are set in platform dashboard
- Check for typos in variable names

## Performance Optimization

### Before Deploying

1. **Optimize Images**
   - Use Cloudinary's image optimization
   - Enable auto format and quality

2. **Enable Compression**
   - Most platforms enable gzip/brotli by default
   - Verify in network tab

3. **Add Caching Headers**
   - Vercel and Netlify handle this automatically
   - For GitHub Pages, consider Cloudflare

4. **Monitor Bundle Size**
   ```bash
   npm run build
   ```
   - Check output size
   - Aim for < 500KB gzipped

### After Deploying

1. **Test Performance**
   - Run Lighthouse audit
   - Check PageSpeed Insights
   - Test on slow 3G network

2. **Monitor Errors**
   - Set up error tracking (Sentry, LogRocket)
   - Monitor API failures
   - Check browser compatibility

## Continuous Deployment

### Git Workflow

Recommended branch strategy:

```
main (production)
  ├── develop (staging)
  │   ├── feature/upload-improvements
  │   └── feature/map-clustering
  └── hotfix/critical-bug
```

### Auto-Deploy Setup

1. **Vercel**: Automatic on Git push
2. **Netlify**: Automatic with Git integration
3. **GitHub Pages**: Via GitHub Actions
4. **Firebase**: Via Firebase CLI or GitHub Actions

## Monitoring & Analytics

### Add Analytics

**Google Analytics**:
1. Create GA4 property
2. Add tracking code to `index.html`

**Vercel Analytics**:
```bash
npm install @vercel/analytics
```

```typescript
// In main.tsx
import { Analytics } from '@vercel/analytics/react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      <Analytics />
    </Provider>
  </React.StrictMode>
);
```

### Error Tracking

**Sentry**:
```bash
npm install @sentry/react
```

```typescript
// In main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
});
```

## Cost Considerations

### Free Tier Limits

- **Vercel**: 100GB bandwidth/month
- **Netlify**: 100GB bandwidth/month
- **GitHub Pages**: 100GB bandwidth/month (soft limit)
- **Firebase**: 10GB storage, 360MB/day downloads
- **Cloudinary**: 25 credits/month (25GB storage or 25GB bandwidth)

### Scaling Beyond Free Tier

If you exceed free tier:
1. Optimize images (Cloudinary auto-optimization)
2. Enable CDN caching
3. Consider paid plans or alternative hosting
4. Implement lazy loading for images

## Security Best Practices

1. **Never commit `.env` file**
   - Already in `.gitignore`
   - Use platform-specific env vars

2. **Use HTTPS only**
   - All platforms provide this automatically

3. **Validate user input**
   - Already implemented in components

4. **Rate limiting**
   - Consider adding API rate limiting
   - Cloudinary has built-in limits

5. **Content Security Policy**
   - Add CSP headers via platform config

## Support

If you encounter issues:
1. Check the troubleshooting section
2. Review platform-specific documentation
3. Check browser console for errors
4. Contact support@alumnx.com

---

**Your application is now ready for the world! 🚀**
