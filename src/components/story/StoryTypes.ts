
export interface StorySegment {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  videoUrl?: string; // Optional URL for background video
  order: number;
}

export interface StoryState {
  segments: StorySegment[];
  currentSegmentIndex: number;
  progress: number;
}
