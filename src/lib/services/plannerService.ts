import { collection, getDocs, query, where, orderBy, setDoc, doc, getDoc } from 'firebase/firestore'
import { db } from '@/src/lib/firebase'
import { Course, SavedPlan, PlanDraft } from '@/src/lib/termwise/types'

// --- COURSE QUERIES ---
// src/lib/services/plannerService.ts

export async function fetchCoursesFromFirebase(filters: {
  query?: string
  department?: string
  term?: string
}) {
  try {
    const coursesRef = collection(db, 'courses')
    let q = query(coursesRef, orderBy('code'))

    // 1. Department Filter (Strict Equality)
    if (filters.department && filters.department !== '__all_departments__') {
      q = query(q, where('subject', '==', filters.department))
    }

    /** * Fix: Term Filter Logic
     * Uses 'array-contains' to scan for a specific term string inside the offeredTerms array.
     */
    if (filters.term && filters.term !== '__all_terms__') {
      q = query(q, where('offeredTerms', 'array-contains', filters.term))
    }

    const snapshot = await getDocs(q)
    const results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Course),
    })) as Course[]

    // 2. Keyword Search (In-Memory)
    if (filters.query) {
      const lowerQuery = filters.query.toLowerCase()
      return results.filter(
        c => c.code.toLowerCase().includes(lowerQuery) || c.title.toLowerCase().includes(lowerQuery)
      )
    }
    return results
  } catch (error) {
    console.error('Firebase fetchCourses error:', error)
    throw error
  }
}

// --- PLAN QUERIES ---
export async function savePlanToFirebase(plan: SavedPlan) {
  try {
    const planRef = doc(db, 'plans', plan.id)
    await setDoc(
      planRef,
      {
        ...plan,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    )
  } catch (error) {
    console.error('Firebase savePlan error:', error)
    throw error
  }
}

export async function fetchUserPlansFromFirebase(userId: string) {
  try {
    const plansRef = collection(db, 'plans')
    const q = query(plansRef, where('userId', '==', userId), orderBy('savedAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => doc.data() as SavedPlan)
  } catch (error) {
    console.error('Firebase fetchPlans error:', error)
    throw error
  }
}

// --- MAJOR QUERIES ---
export async function fetchMajorsFromFirebase() {
  try {
    const majorsRef = collection(db, 'majors')
    const snapshot = await getDocs(majorsRef)
    return snapshot.docs.map(doc => doc.data())
  } catch (error) {
    console.error('Firebase fetchMajors error:', error)
    throw error
  }
}
