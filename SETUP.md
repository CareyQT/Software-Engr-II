# Setup & Deployment

This document is intended for developers who want to run or deploy TermWise locally.

## Prerequisites
- Node.js v18 or higher
- npm v9 or higher
- A Firebase account with access to the TermWise project

## 1. Clone the Repository
```bash
git clone https://github.com/CareyQT/Software-Engr-II.git
cd Software-Engr-II
```

## 2. Install Dependencies
```bash
npm install
```

## 3. Configure Environment Variables
Create a `.env.local` file in the root of the project with the following Firebase credentials:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

These values can be found in the Firebase Console under **Project Settings > General > Your Apps**.

## 4. Run Locally
```bash
npm run dev
```
The app will be available at http://localhost:3000 or another port if 3000 is busy

## 5. Deployment
The app is hosted on Firebase Hosting. To deploy:
```bash
npm run build
firebase deploy
```

> Make sure you have the Firebase CLI installed (`npm install -g firebase-tools`) and are logged in (`firebase login`) before deploying.

## Firebase Services Used
- **Firestore** — primary database
- **Authentication** — user login/signup
- **Hosting** — static site deployment at https://termwise-474be.web.app/
