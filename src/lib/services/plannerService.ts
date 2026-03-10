import { collection, getDocs, query, where, orderBy, setDoc, doc, getDoc } from 'firebase/firestore'
import { db } from '@/src/lib/firebase'
import { Course, SavedPlan, PlanDraft } from '@/src/lib/termwise/types'

// --- COURSE QUERIES ---
export async function fetchCoursesFromFirebase(filters: {
  query?: string
  department?: string
  term?: string
}) {
  try {
    const coursesRef = collection(db, 'courses')
    let q = query(coursesRef, orderBy('code'))

    if (filters.department) {
      q = query(q, where('subject', '==', filters.department))
    }

    const snapshot = await getDocs(q)
    const results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Course), // Cast the individual document data
    })) as Course[]

    // Firebase doesn't support partial string matching (search) well natively,
    // so we filter the remaining results in memory for the 'query' string.
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
