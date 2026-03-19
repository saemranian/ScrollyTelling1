
"use client";

import React, { useState, useEffect } from 'react';
import { StoryEditor } from '@/components/story/StoryEditor';
import { StorySegment } from '@/components/story/StoryTypes';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { getStorySegments, saveStorySegments } from '@/services/story-service';
import { useFirestore, useUser, useAuth } from '@/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Database, Loader2 } from 'lucide-react';
import { signInAnonymously } from 'firebase/auth';

const initialDefaultSegments: StorySegment[] = [
  {
    id: '1',
    title: 'A New Beginning',
    description: 'The journey began in a small wooden workshop, where every tool held a story and every shaving of wood carried the scent of possibility.',
    imageUrl: 'https://picsum.photos/seed/story1/1200/800',
    order: 0,
  }
];

export default function EditorPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const [segments, setSegments] = useState<StorySegment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth && !user && !isUserLoading) {
      signInAnonymously(auth).catch(err => console.error("Anonymous auth failed", err));
    }
  }, [auth, user, isUserLoading]);

  useEffect(() => {
    async function loadData() {
      if (!db) return;
      try {
        const data = await getStorySegments(db);
        setSegments(data.length > 0 ? data : initialDefaultSegments);
      } catch (error) {
        console.error("Failed to load segments:", error);
        setSegments(initialDefaultSegments);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [db]);

  const handleSave = async (newSegments: StorySegment[]) => {
    if (!db || !user) {
      toast({
        title: "Auth Error",
        description: "You must be signed in to save. Please wait a moment and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      await saveStorySegments(db, user.uid, newSegments);
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

  if (loading || isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading Narrative Data...</p>
        </div>
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
              Firestore could not be initialized. Please check your Firebase configuration.
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
