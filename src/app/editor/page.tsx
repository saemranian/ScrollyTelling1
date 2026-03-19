"use client";

import React, { useState, useEffect } from 'react';
import { StoryEditor } from '@/components/story/StoryEditor';
import { StorySegment } from '@/components/story/StoryTypes';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { getStorySegments, saveStorySegments } from '@/services/story-service';
import { db } from '@/lib/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Database } from 'lucide-react';

const initialDefaultSegments: StorySegment[] = [
  {
    id: '1',
    title: 'A New Beginning',
    description: 'The journey began in a small wooden workshop, where every tool held a story and every shaving of wood carried the scent of possibility.',
    imageUrl: PlaceHolderImages.find(p => p.id === 'scene-1')?.imageUrl || '',
    order: 0,
  }
];

export default function EditorPage() {
  const { toast } = useToast();
  const [segments, setSegments] = useState<StorySegment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getStorySegments();
        setSegments(data.length > 0 ? data : initialDefaultSegments);
      } catch (error) {
        console.error("Failed to load segments:", error);
        setSegments(initialDefaultSegments);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async (newSegments: StorySegment[]) => {
    try {
      await saveStorySegments(newSegments);
      setSegments(newSegments);
      toast({
        title: "Narrative Saved",
        description: "Your story segments have been persisted to the database.",
      });
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message || "There was an error saving to the database.",
        variant: "destructive",
      });
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground animate-pulse">Loading Narrative Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {!db && (
        <div className="max-w-4xl mx-auto pt-6 px-6">
          <Alert variant="destructive">
            <Database className="h-4 w-4" />
            <AlertTitle>Database Not Connected</AlertTitle>
            <AlertDescription>
              Your Firebase API keys are missing. Please add them to your .env file to enable saving.
            </AlertDescription>
          </Alert>
        </div>
      )}
      <StoryEditor 
        initialSegments={segments} 
        onSave={handleSave} 
      />
      <Toaster />
    </div>
  );
}
