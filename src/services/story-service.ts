
import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  query, 
  orderBy, 
  writeBatch,
  deleteDoc
} from "firebase/firestore";
import { StorySegment } from "@/components/story/StoryTypes";

const COLLECTION_NAME = "story_segments";

export async function getStorySegments(): Promise<StorySegment[]> {
  const q = query(collection(db, COLLECTION_NAME), orderBy("order", "asc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as StorySegment));
}

export async function saveStorySegments(segments: StorySegment[]): Promise<void> {
  const batch = writeBatch(db);
  
  // First, clear existing segments to handle deletions easily in this prototype
  // In a production app, you'd sync changes more granularly
  const currentSegments = await getStorySegments();
  for (const segment of currentSegments) {
    batch.delete(doc(db, COLLECTION_NAME, segment.id));
  }

  // Add new/updated segments
  segments.forEach((segment, index) => {
    const segmentRef = doc(db, COLLECTION_NAME, segment.id);
    batch.set(segmentRef, {
      ...segment,
      order: index // Ensure order matches current list position
    });
  });

  await batch.commit();
}
