
"use client";

import React, { useState } from 'react';
import { StoryEditor } from '@/components/story/StoryEditor';
import { StorySegment } from '@/components/story/StoryTypes';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

const initialSegments: StorySegment[] = [
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
  }
];

export default function EditorPage() {
  const { toast } = useToast();
  const [segments, setSegments] = useState<StorySegment[]>(initialSegments);

  const handleSave = (newSegments: StorySegment[]) => {
    setSegments(newSegments);
    toast({
      title: "Narrative Saved",
      description: "Your story segments and synchronization points have been updated.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <StoryEditor 
        initialSegments={segments} 
        onSave={handleSave} 
      />
      <Toaster />
    </div>
  );
}
