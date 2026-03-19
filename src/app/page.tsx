
"use client";

import React, { useState, useEffect } from 'react';
import { NarrativeViewer } from '@/components/story/NarrativeViewer';
import { StorySegment } from '@/components/story/StoryTypes';
import { Button } from '@/components/ui/button';
import { Edit3, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getStorySegments } from '@/services/story-service';
import { useFirestore } from '@/firebase';

const defaultSegments: StorySegment[] = [
  {
    id: 'chapter-1',
    title: 'The Beginning',
    description: 'Place your first video in the public folder and link it here to start the journey.',
    imageUrl: 'https://picsum.photos/seed/scene1/1200/800',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    order: 0,
  },
  {
    id: 'chapter-2',
    title: 'The Progression',
    description: 'As you scroll, the second video will scrub frame-by-frame, creating a stop-motion feel.',
    imageUrl: 'https://picsum.photos/seed/scene2/1200/800',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    order: 1,
  },
  {
    id: 'chapter-3',
    title: 'The Conclusion',
    description: 'The final chapter brings the narrative to a close with your third interactive video.',
    imageUrl: 'https://picsum.photos/seed/scene3/1200/800',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    order: 2,
  }
];

export default function Home() {
  const db = useFirestore();
  const [segments, setSegments] = useState<StorySegment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!db) return;
      try {
        const data = await getStorySegments(db);
        setSegments(data.length > 0 ? data : defaultSegments);
      } catch (error) {
        console.error("Failed to load segments:", error);
        setSegments(defaultSegments);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [db]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen">
      <div className="fixed top-6 right-6 z-50">
        <Link href="/editor">
          <Button variant="secondary" className="rounded-full shadow-lg bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-background">
            <Edit3 className="w-4 h-4 mr-2" /> Editor Mode
          </Button>
        </Link>
      </div>

      <NarrativeViewer segments={segments} />
    </main>
  );
}
