import { 
  collection, 
  getDocs, 
  doc, 
  query, 
  orderBy, 
  writeBatch,
  Firestore,
  serverTimestamp
} from "firebase/firestore";
import { StorySegment } from "@/components/story/StoryTypes";

// Using path from backend.json: /published_stories/{storyId}/segments/{segmentId}
const STORY_ID = "default-interactive-story";
const PUBLISHED_COLLECTION = "published_stories";

/**
 * Fetches all story segments from the default published story.
 */
export async function getStorySegments(db: Firestore): Promise<StorySegment[]> {
  try {
    const segmentsRef = collection(db, PUBLISHED_COLLECTION, STORY_ID, "segments");
    const q = query(segmentsRef, orderBy("order", "asc"));
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
 * Persists story segments. In a real app, this would handle both drafts and published stories.
 * For this prototype, we save directly to a public story.
 */
export async function saveStorySegments(db: Firestore, userId: string, segments: StorySegment[]): Promise<void> {
  const batch = writeBatch(db);
  const storyRef = doc(db, PUBLISHED_COLLECTION, STORY_ID);
  const segmentsRef = collection(db, PUBLISHED_COLLECTION, STORY_ID, "segments");

  // 1. Ensure the parent story document exists
  batch.set(storyRef, {
    title: "The Main Narrative",
    shortDescription: "An immersive scroll-driven journey.",
    creatorId: userId,
    isPublished: true,
    updatedAt: serverTimestamp()
  }, { merge: true });

  // 2. Clear existing segments (Prototype approach: simple sync)
  const currentSegmentsSnapshot = await getDocs(segmentsRef);
  currentSegmentsSnapshot.forEach((document) => {
    batch.delete(doc(db, PUBLISHED_COLLECTION, STORY_ID, "segments", document.id));
  });

  // 3. Add new segments
  segments.forEach((segment, index) => {
    const segmentId = segment.id && !segment.id.includes('.') ? segment.id : doc(segmentsRef).id;
    const segmentDocRef = doc(db, PUBLISHED_COLLECTION, STORY_ID, "segments", segmentId);
    
    const { id, ...data } = segment;
    
    batch.set(segmentDocRef, {
      ...data,
      id: segmentId,
      storyId: STORY_ID,
      creatorId: userId,
      order: index
    });
  });

  await batch.commit();
}
