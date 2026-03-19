
"use client";

import React, { useState, useEffect } from 'react';
import { NarrativeViewer } from '@/components/story/NarrativeViewer';
import { StorySegment } from '@/components/story/StoryTypes';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Edit3, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getStorySegments } from '@/services/story-service';
import { useFirestore } from '@/firebase';

const defaultSegments: StorySegment[] = [
  {
    id: '1',
    title: 'A New Beginning',
    description: 'The journey began in a small wooden workshop, where every tool held a story and every shaving of wood carried the scent of possibility.',
    imageUrl: 'https://picsum.photos/seed/story1/1200/800',
    order: 0,
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
