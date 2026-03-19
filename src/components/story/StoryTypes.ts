
export interface StorySegment {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  order: number;
}

export interface StoryState {
  segments: StorySegment[];
  currentSegmentIndex: number;
  progress: number;
}
