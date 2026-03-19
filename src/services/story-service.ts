
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
 * Persists story segments directly to the public collection.
 */
export async function saveStorySegments(db: Firestore, userId: string, segments: StorySegment[]): Promise<void> {
  const batch = writeBatch(db);
  const storyRef = doc(db, PUBLISHED_COLLECTION, STORY_ID);
  const segmentsRef = collection(db, PUBLISHED_COLLECTION, STORY_ID, "segments");

  // 1. Update the parent story document
  batch.set(storyRef, {
    title: "The Main Narrative",
    shortDescription: "An immersive scroll-driven journey.",
    creatorId: userId,
    isPublished: true,
    updatedAt: serverTimestamp()
  }, { merge: true });

  // 2. We don't delete old segments in the batch to avoid permission issues with older sessions.
  // Instead, we just overwrite existing ones or add new ones.
  segments.forEach((segment, index) => {
    // Generate a valid ID if it's missing or invalid
    const segmentId = (segment.id && segment.id.length > 5) ? segment.id : `segment-${index}`;
    const segmentDocRef = doc(db, PUBLISHED_COLLECTION, STORY_ID, "segments", segmentId);
    
    // Remove the ID from the data object to avoid redundant storage
    const { id, ...data } = segment;
    
    batch.set(segmentDocRef, {
      ...data,
      id: segmentId,
      storyId: STORY_ID,
      creatorId: userId,
      order: index
    }, { merge: true });
  });

  await batch.commit();
}
