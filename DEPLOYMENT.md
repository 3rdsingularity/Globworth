# GlobeWorth Deployment Guide

This guide covers deploying GlobeWorth to production environments.

## Table of Contents

1. [Firebase Setup](#firebase-setup)
2. [Vercel Deployment](#vercel-deployment)
3. [Netlify Deployment](#netlify-deployment)
4. [Firebase Hosting](#firebase-hosting)
5. [Environment Configuration](#environment-configuration)
6. [Firestore Security Rules](#firestore-security-rules)
7. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebasefirebase.google.com/)
2. Click "Add Project"
3. Enter project name (e.g., "globeworth-prod")
4. Enable Google Analytics (optional)
5. Accept terms and create project

### 2. Enable Authentication

1. Go to **Authentication** → **Get Started**
2. Enable **Google** sign-in provider
3. Configure OAuth consent screen
4. Add support email
5. Save

### 3. Create Firestore Database

1. Go to **Firestore Database** → **Create Database**
2. Choose **Start in production mode**
3. Select region (e.g., `europe-west1` for EU, `us-central` for US)
4. Enable

### 4. Get Firebase Config

1. Go to **Project Settings** (gear icon)
2. Under **General**, scroll to **Your apps**
3. Click **</>** to add web app
4. Register app with nickname (e.g., "GlobeWorth Web")
5. Copy the Firebase configuration object

### 5. Configure Environment Variables

Create `.env` file in project root:

```env
VITE_FIREBASE_API_KEY=AIzaSyB...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## Vercel Deployment

### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Option 2: Git Integration

1. Push code to GitHub/GitLab/Bitbucket
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click **New Project**
4. Import your repository
5. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add Environment Variables
7. Deploy

---

## Netlify Deployment

### Option 1: Netlify CLI

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Deploy
netlify deploy --prod --dir=dist
```

### Option 2: Git Integration

1. Push code to GitHub/GitLab/Bitbucket
2. Go to [Netlify Dashboard](https://app.netlify.com/)
3. Click **New site from Git**
4. Connect to your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add Environment Variables
7. Deploy

---

## Firebase Hosting

### Setup

```bash
# Install Firebase CLI
npm i -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting

# Select your project
# Set public directory: dist
# Configure as SPA: Yes
```

### Deploy

```bash
# Build
npm run build

# Deploy
firebase deploy --only hosting
```

---

## Environment Configuration

### Required Variables

| Variable | Description | Source |
|----------|-------------|--------|
| `VITE_FIREBASE_API_KEY` | Firebase API key | Firebase Console |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain | Firebase Console |
| `VITE_FIREBASE_PROJECT_ID` | Project ID | Firebase Console |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket | Firebase Console |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging ID | Firebase Console |
| `VITE_FIREBASE_APP_ID` | App ID | Firebase Console |
| `VITE_FIREBASE_MEASUREMENT_ID` | Analytics ID | Firebase Console |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_EXCHANGE_RATE_API_KEY` | Exchange rate API key | Free tier |

---

## Firestore Security Rules

Create `firestore.rules`:

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /assets/{assetId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /liabilities/{liabilityId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /snapshots/{snapshotId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /settings/{settingsId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

---

## Post-Deployment Checklist

### Functionality Tests

- [ ] Google OAuth login works
- [ ] Dashboard loads with no errors
- [ ] Add asset functionality works
- [ ] Add liability functionality works
- [ ] Exchange rates refresh correctly
- [ ] Currency conversion works
- [ ] Charts render properly
- [ ] Dark mode toggle works
- [ ] Data export works
- [ ] Settings save correctly

### Security Checks

- [ ] Firestore security rules deployed
- [ ] Environment variables not exposed in client
- [ ] HTTPS enforced
- [ ] OAuth redirect URLs configured

### Performance

- [ ] First load under 3 seconds
- [ ] Charts render smoothly
- [ ] No console errors
- [ ] Responsive on mobile

### Monitoring

- [ ] Firebase Analytics enabled
- [ ] Error tracking configured (optional: Sentry)
- [ ] Uptime monitoring (optional)

---

## Troubleshooting

### Common Issues

**Build fails with "Cannot find module"**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Firebase auth not working**
- Check OAuth redirect URLs in Google Cloud Console
- Verify `VITE_FIREBASE_AUTH_DOMAIN` is correct
- Enable Google sign-in in Firebase Console

**Exchange rates not loading**
- Check browser console for API errors
- Verify API key if using paid tier
- Check rate limiting

**Firestore permission denied**
- Deploy security rules: `firebase deploy --only firestore:rules`
- Verify user is authenticated
- Check rules match your collection structure

---

## Production Checklist

Before going live:

1. [ ] Set up Firebase project
2. [ ] Configure OAuth consent screen
3. [ ] Add authorized domains
4. [ ] Deploy Firestore security rules
5. [ ] Set up environment variables
6. [ ] Test all features
7. [ ] Enable Firebase Analytics
8. [ ] Configure custom domain (optional)
9. [ ] Set up SSL certificate
10. [ ] Create backup strategy

---

## Support

For deployment issues:
- Firebase: [Firebase Support](https://firebase.google.com/support)
- Vercel: [Vercel Docs](https://vercel.com/docs)
- Netlify: [Netlify Docs](https://docs.netlify.com/)

---

**Happy Deploying! 🚀**
