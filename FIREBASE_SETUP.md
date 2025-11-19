# Firebase Setup Guide

This guide will walk you through setting up Firebase for the FinMarket Simulator application.

## Prerequisites

- A Google account
- Node.js and npm installed

## Step-by-Step Setup

### 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "finmarket-simulator")
4. Follow the prompts (you can disable Google Analytics if you don't need it)
5. Click "Create Project"

### 2. Register Your Web App

1. In your Firebase project, click the **Web icon** (`</>`) to add a web app
2. Enter an app nickname (e.g., "FinMarket Web App")
3. **Do NOT** check "Also set up Firebase Hosting" (unless you plan to use it)
4. Click "Register app"
5. Copy the Firebase configuration values (you'll need these for your `.env` file)

### 3. Enable Authentication

1. In the Firebase Console, navigate to **Build > Authentication**
2. Click "Get started"
3. Click on the **Sign-in method** tab
4. Enable **Email/Password** authentication:
   - Click on "Email/Password"
   - Toggle the first switch to **Enable**
   - Click "Save"

### 4. Create Firestore Database

1. In the Firebase Console, navigate to **Build > Firestore Database**
2. Click "Create database"
3. Choose **Start in production mode** (we'll add rules next)
4. Select a location for your database (choose one close to your users)
5. Click "Enable"

### 5. Set Up Firestore Security Rules

You have two options to deploy the security rules:

#### Option A: Using Firebase CLI (Recommended)

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init firestore
   ```
   - Select your Firebase project
   - Accept the default `firestore.rules` file (it's already in the project root)
   - Accept the default `firestore.indexes.json` file

4. Deploy the security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

#### Option B: Manual Copy-Paste

1. In the Firebase Console, navigate to **Build > Firestore Database**
2. Click on the **Rules** tab
3. Copy the entire contents of the `firestore.rules` file from this project
4. Paste it into the Firebase Console rules editor
5. Click "Publish"

### 6. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase configuration values in `.env`:
   ```env
   # Backend Server Configuration
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   PORT=3001
   FRONTEND_URL=http://localhost:5173

   # Frontend Configuration
   VITE_API_URL=http://localhost:3001

   # Firebase Configuration (from step 2)
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

### 7. Get Anthropic API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to **API Keys**
4. Click "Create Key"
5. Copy the API key and add it to your `.env` file as `ANTHROPIC_API_KEY`

## Testing Your Setup

1. Start the backend server:
   ```bash
   npm run server:dev
   ```

2. In a new terminal, start the frontend:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:5173`
4. Try creating an account and logging in
5. Try uploading a course material (you can use any PDF for testing)

## Troubleshooting

### Permission Denied Errors

If you see `FirebaseError: [code=permission-denied]`:

1. **Check that security rules are deployed**: Go to Firebase Console > Firestore Database > Rules and verify the rules match `firestore.rules`
2. **Verify you're logged in**: Make sure you've created an account and are logged in
3. **Check Firebase config**: Verify all `VITE_FIREBASE_*` variables in `.env` are correct

### CORS Errors with Anthropic API

If you see CORS errors:

1. **Verify backend is running**: Make sure `npm run server:dev` is running
2. **Check API URL**: Verify `VITE_API_URL` in `.env` matches your backend URL
3. **Check backend logs**: Look for errors in the terminal running the backend server

### Backend Connection Errors

If the frontend can't connect to the backend:

1. **Verify backend is running** on port 3001
2. **Check firewall settings**: Make sure port 3001 is not blocked
3. **Verify VITE_API_URL**: Should be `http://localhost:3001` in development

## Production Deployment

For production deployment:

1. **Update CORS settings** in `server/index.js` to allow your production domain
2. **Update environment variables** for production URLs
3. **Enable Firebase App Check** for additional security
4. **Review Firestore security rules** and add additional validation as needed
5. **Set up Firebase Hosting** or deploy to your preferred hosting platform

## Firestore Collections Structure

The app uses the following Firestore collections:

- **users**: User profiles
- **portfolios**: User portfolios with positions and performance data
- **trades**: Trade history
- **scenarios**: Generated market scenarios
- **scenarioResults**: Completed scenario results with feedback
- **materials**: Uploaded course materials metadata

All collections are secured with rules ensuring users can only access their own data.

## Support

If you encounter issues:

1. Check the browser console for detailed error messages
2. Check the backend server logs
3. Verify all environment variables are set correctly
4. Review the Firebase Console for configuration issues
