
"use client";

import React, { useState } from 'react';
import { StorySegment } from './StoryTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { generateStorySegmentDescription } from '@/ai/flows/generate-story-segment-description';
import { Sparkles, Trash2, Plus, ArrowLeft, Video, Image as LucideImage, Info, Loader2, Save, FileVideo, HardDrive } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

interface StoryEditorProps {
  initialSegments: StorySegment[];
  onSave: (segments: StorySegment[]) => Promise<void>;
}

export function StoryEditor({ initialSegments, onSave }: StoryEditorProps) {
  const [segments, setSegments] = useState<StorySegment[]>(initialSegments);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const addSegment = () => {
    const newSegment: StorySegment = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Chapter',
      description: 'Continue the story...',
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

  const handleSaveClick = async () => {
    setIsSaving(true);
    try {
      await onSave(segments);
    } catch (err) {
       console.error("Save error", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-headline font-bold text-primary">Narrative Editor</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addSegment} disabled={isSaving}>
            <Plus className="w-4 h-4 mr-2" /> Add Segment
          </Button>
          <Button onClick={handleSaveClick} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <Alert className="bg-primary/5 border-primary/20">
          <HardDrive className="h-4 w-4" />
          <AlertTitle>Using Local Files</AlertTitle>
          <AlertDescription className="text-xs">
            1. Put your MP4 files in the <strong>public/</strong> folder of this project.<br/>
            2. In the "Video URL" field below, type <strong>/your-filename.mp4</strong>
          </AlertDescription>
        </Alert>
        <Alert className="bg-secondary/5 border-secondary/20">
          <FileVideo className="h-4 w-4" />
          <AlertTitle>Pro-Tip: Smooth Scrolling</AlertTitle>
          <AlertDescription className="text-xs">
            When exporting your video from PNGs, set <strong>Keyframe Distance to 1</strong>. This makes the scrolly-telling perfectly smooth!
          </AlertDescription>
        </Alert>
      </div>

      <div className="space-y-8">
        {segments.map((segment, index) => (
          <Card key={segment.id} className="overflow-hidden border-muted shadow-md">
            <CardHeader className="flex flex-row items-center justify-between bg-muted/20 border-b">
              <CardTitle className="text-lg font-bold text-primary/80">Segment #{index + 1}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => removeSegment(segment.id)} className="text-destructive hover:bg-destructive/10">
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Chapter Title</label>
                  <Input 
                    placeholder="Enter segment title..."
                    value={segment.title} 
                    onChange={(e) => updateSegment(segment.id, { title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Story Text</label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleAiGenerate(segment.id, segment.title)}
                      disabled={isGenerating === segment.id}
                      className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      {isGenerating === segment.id ? 'Writing...' : 'AI Enhance'}
                    </Button>
                  </div>
                  <Textarea 
                    placeholder="Describe this part of the journey..."
                    rows={5}
                    value={segment.description} 
                    onChange={(e) => updateSegment(segment.id, { description: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <LucideImage className="w-3 h-3" /> Background Image URL
                    </label>
                    <Input 
                      placeholder="https://images.unsplash.com/..."
                      value={segment.imageUrl} 
                      onChange={(e) => updateSegment(segment.id, { imageUrl: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Video className="w-3 h-3" /> Direct Video URL (MP4)
                    </label>
                    <Input 
                      placeholder="/video1.mp4 or https://site.com/video.mp4"
                      value={segment.videoUrl || ''} 
                      onChange={(e) => updateSegment(segment.id, { videoUrl: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="aspect-video relative rounded-lg overflow-hidden bg-muted border-2 border-muted-foreground/10 group">
                   {segment.videoUrl ? (
                     <div className="w-full h-full bg-black flex items-center justify-center">
                        <Video className="w-12 h-12 text-white/20" />
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white/40 font-bold uppercase tracking-widest">Video Linked</span>
                     </div>
                   ) : (
                     <img 
                       src={segment.imageUrl} 
                       alt="Preview" 
                       className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                     />
                   )}
                   <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white font-bold uppercase tracking-tighter">
                     Preview
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {segments.length === 0 && (
        <div className="text-center py-24 border-2 border-dashed border-muted rounded-xl bg-muted/5">
          <p className="text-muted-foreground mb-4 font-body">Your narrative is currently empty.</p>
          <Button onClick={addSegment} className="rounded-full px-8">
            <Plus className="w-4 h-4 mr-2" /> Start Your First Chapter
          </Button>
        </div>
      )}
    </div>
  );
}
