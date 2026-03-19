
import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  doc, 
  query, 
  orderBy, 
  writeBatch,
  deleteDoc
} from "firebase/firestore";
import { StorySegment } from "@/components/story/StoryTypes";

const COLLECTION_NAME = "story_segments";

/**
 * Fetches all story segments from Firestore, ordered by their sequence.
 */
export async function getStorySegments(): Promise<StorySegment[]> {
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
 * For this prototype, it replaces the collection to ensure order and deletions are synced.
 */
export async function saveStorySegments(segments: StorySegment[]): Promise<void> {
  const batch = writeBatch(db);
  
  // 1. Get current segments to delete them (simplifies sync for prototype)
  const currentSegmentsSnapshot = await getDocs(collection(db, COLLECTION_NAME));
  currentSegmentsSnapshot.forEach((document) => {
    batch.delete(doc(db, COLLECTION_NAME, document.id));
  });

  // 2. Add the new/updated segments with updated order
  segments.forEach((segment, index) => {
    // Generate a clean ID if it doesn't exist, otherwise use existing
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
