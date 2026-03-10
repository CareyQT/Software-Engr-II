import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc } from 'firebase/firestore';
import { COURSE_CATALOG } from '../lib/termwise/data.js';

// Manually include config since process.env might not load in a raw node script
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", 
  projectId: "YOUR_PROJECT_ID",
  // ... copy the rest from your lib/firebase.js
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  const batch = writeBatch(db);

  console.log("Starting migration of courses...");
  COURSE_CATALOG.forEach((course) => {
    const courseRef = doc(collection(db, "courses"), course.code);
    batch.set(courseRef, {
      ...course,
      updatedAt: new Date().toISOString()
    });
  });

  console.log("Adding sample majors...");
  const majors = [
    { name: 'Computer Science', department: 'EECS' },
    { name: 'Electrical Engineering', department: 'EECS' },
    { name: 'Mechanical Engineering', department: 'MIME' }
  ];

  majors.forEach((major) => {
    const majorRef = doc(collection(db, "majors"));
    batch.set(majorRef, major);
  });

  await batch.commit();
  console.log("✅ Success! Check your Firebase Console.");
}

seed().catch(err => console.error("❌ Seed failed:", err));