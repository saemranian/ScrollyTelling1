
"use client";

import React, { useState } from 'react';
import { StorySegment } from './StoryTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { generateStorySegmentDescription } from '@/ai/flows/generate-story-segment-description';
import { Sparkles, Trash2, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface StoryEditorProps {
  initialSegments: StorySegment[];
  onSave: (segments: StorySegment[]) => void;
}

export function StoryEditor({ initialSegments, onSave }: StoryEditorProps) {
  const [segments, setSegments] = useState<StorySegment[]>(initialSegments);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const addSegment = () => {
    const newSegment: StorySegment = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Chapter',
      description: 'Once upon a time...',
      imageUrl: `https://picsum.photos/seed/${Math.random()}/1200/800`,
      order: segments.length,
    };
    setSegments([...segments, newSegment]);
  };

  const updateSegment = (id: string, updates: Partial<StorySegment>) => {
    setSegments(segments.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeSegment = (id: string) => {
    setSegments(segments.filter(s => s.id !== id));
  };

  const handleAiGenerate = async (id: string, title: string) => {
    setIsGenerating(id);
    try {
      const result = await generateStorySegmentDescription({ promptOrKeyDetails: title });
      updateSegment(id, { description: result.description });
    } catch (error) {
      console.error("AI Generation failed", error);
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-headline font-bold text-primary">Story Content Editor</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addSegment}>
            <Plus className="w-4 h-4 mr-2" /> Add Segment
          </Button>
          <Button onClick={() => onSave(segments)}>Save Narrative</Button>
        </div>
      </header>

      <div className="space-y-6">
        {segments.map((segment, index) => (
          <Card key={segment.id} className="overflow-hidden border-muted">
            <CardHeader className="flex flex-row items-center justify-between bg-muted/30">
              <CardTitle className="text-lg">Segment #{index + 1}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => removeSegment(segment.id)} className="text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Title</label>
                  <Input 
                    value={segment.title} 
                    onChange={(e) => updateSegment(segment.id, { title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Description</label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleAiGenerate(segment.id, segment.title)}
                      disabled={isGenerating === segment.id}
                      className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      {isGenerating === segment.id ? 'Refining...' : 'Refine with AI'}
                    </Button>
                  </div>
                  <Textarea 
                    rows={4}
                    value={segment.description} 
                    onChange={(e) => updateSegment(segment.id, { description: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-4">
                 <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Stop-Motion Image URL</label>
                  <Input 
                    value={segment.imageUrl} 
                    onChange={(e) => updateSegment(segment.id, { imageUrl: e.target.value })}
                  />
                </div>
                <div className="aspect-video relative rounded-md overflow-hidden bg-muted">
                   <img 
                    src={segment.imageUrl} 
                    alt="Preview" 
                    className="object-cover w-full h-full"
                   />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {segments.length === 0 && (
        <div className="text-center py-24 border-2 border-dashed border-muted rounded-xl">
          <p className="text-muted-foreground mb-4">Your narrative is empty. Start by adding your first segment.</p>
          <Button onClick={addSegment}>
            <Plus className="w-4 h-4 mr-2" /> Create First Chapter
          </Button>
        </div>
      )}
    </div>
  );
}
