import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  doc, 
  query, 
  orderBy, 
  writeBatch
} from "firebase/firestore";
import { StorySegment } from "@/components/story/StoryTypes";

const COLLECTION_NAME = "story_segments";

/**
 * Fetches all story segments from Firestore, ordered by their sequence.
 */
export async function getStorySegments(): Promise<StorySegment[]> {
  if (!db) {
    console.warn("Firestore is not initialized. Check your environment variables.");
    return [];
  }
  
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("order", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as StorySegment));
  } catch (error) {
    console.error("Error fetching story segments:", error);
    return [];
  }
}

/**
 * Persists the entire list of story segments to Firestore.
 */
export async function saveStorySegments(segments: StorySegment[]): Promise<void> {
  if (!db) {
    throw new Error("Database not connected. Please check your Firebase project settings.");
  }

  const batch = writeBatch(db);
  
  // 1. Get current segments to clear them (simplifies sync for prototype)
  const currentSegmentsSnapshot = await getDocs(collection(db, COLLECTION_NAME));
  currentSegmentsSnapshot.forEach((document) => {
    batch.delete(doc(db, COLLECTION_NAME, document.id));
  });

  // 2. Add the new/updated segments
  segments.forEach((segment, index) => {
    const segmentId = segment.id || doc(collection(db, COLLECTION_NAME)).id;
    const segmentRef = doc(db, COLLECTION_NAME, segmentId);
    
    batch.set(segmentRef, {
      ...segment,
      id: segmentId,
      order: index
    });
  });

  await batch.commit();
}
