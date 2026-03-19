
"use client";

import React, { useState } from 'react';
import { NarrativeViewer } from '@/components/story/NarrativeViewer';
import { StorySegment } from '@/components/story/StoryTypes';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Edit3 } from 'lucide-react';
import Link from 'next/link';

const defaultSegments: StorySegment[] = [
  {
    id: '1',
    title: 'A New Beginning',
    description: 'The journey began in a small wooden workshop, where every tool held a story and every shaving of wood carried the scent of possibility.',
    imageUrl: PlaceHolderImages.find(p => p.id === 'scene-1')?.imageUrl || '',
    order: 0,
  },
  {
    id: '2',
    title: 'The Breath of Change',
    description: 'A sudden breeze swept through the open window, stirring the curtains and whispering of far-off places and the adventures that awaited beyond the sill.',
    imageUrl: PlaceHolderImages.find(p => p.id === 'scene-2')?.imageUrl || '',
    order: 1,
  },
  {
    id: '3',
    title: 'Nurturing Life',
    description: 'With gentle hands, the first seeds of the dream were planted. It required patience, warmth, and the steady passage of time to see the first green sprouts.',
    imageUrl: PlaceHolderImages.find(p => p.id === 'scene-3')?.imageUrl || '',
    order: 2,
  },
  {
    id: '4',
    title: 'Moments of Reflection',
    description: 'In the quiet hours, as steam rose from a warm cup, there was time to contemplate the path taken and the mountain still left to climb.',
    imageUrl: PlaceHolderImages.find(p => p.id === 'scene-4')?.imageUrl || '',
    order: 3,
  },
  {
    id: '5',
    title: 'Into the Light',
    description: 'Finally, the shadows retreated. The path was clear, illuminated by the golden rays of a sun that never truly sets for those who keep moving.',
    imageUrl: PlaceHolderImages.find(p => p.id === 'scene-5')?.imageUrl || '',
    order: 4,
  }
];

export default function Home() {
  const [segments] = useState<StorySegment[]>(defaultSegments);

  return (
    <main className="relative min-h-screen">
      {/* Floating Editor Access (for demo purposes) */}
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
