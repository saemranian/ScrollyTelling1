
"use client";

import React, { useState } from 'react';
import { StorySegment } from './StoryTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { generateStorySegmentDescription } from '@/ai/flows/generate-story-segment-description';
import { Sparkles, Trash2, Plus, ArrowLeft, Video, Image as LucideImage, Info, Loader2, Save, FileVideo, HardDrive, Sparkle } from 'lucide-react';
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
    <div className="max-w-5xl mx-auto py-16 px-6">
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <Link href="/">
            <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-headline font-bold text-primary">Narrative Studio</h1>
            <p className="text-sm text-muted-foreground">Craft your interactive scrollytelling experience.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={addSegment} disabled={isSaving} className="h-12 border-2">
            <Plus className="w-4 h-4 mr-2" /> Add Chapter
          </Button>
          <Button onClick={handleSaveClick} disabled={isSaving} className="h-12 px-8 shadow-lg shadow-primary/20">
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {isSaving ? 'Persisting...' : 'Save Narrative'}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Alert className="bg-primary/5 border-primary/20 col-span-1">
          <HardDrive className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary font-bold">1. Folder Setup</AlertTitle>
          <AlertDescription className="text-xs leading-relaxed">
            Drop your video files into the <strong>public/</strong> folder. Use paths like <code>/my-video.webm</code> below.
          </AlertDescription>
        </Alert>
        <Alert className="bg-secondary/5 border-secondary/20 col-span-1">
          <FileVideo className="h-4 w-4 text-secondary" />
          <AlertTitle className="text-secondary font-bold">2. Transparency</AlertTitle>
          <AlertDescription className="text-xs leading-relaxed">
            For transparent videos, use <strong>WebM (VP9 with Alpha)</strong>. Set Keyframe Distance to 1 for smooth scrolling.
          </AlertDescription>
        </Alert>
        <Alert className="bg-accent/5 border-accent/20 col-span-1">
          <Sparkle className="h-4 w-4 text-accent" />
          <AlertTitle className="text-accent font-bold">3. AI Power</AlertTitle>
          <AlertDescription className="text-xs leading-relaxed">
            Use the "AI Enhance" button to turn a simple title into a poetic narrative description.
          </AlertDescription>
        </Alert>
      </div>

      <div className="space-y-10">
        {segments.map((segment, index) => (
          <Card key={segment.id} className="overflow-hidden border-2 border-muted/30 shadow-xl transition-all hover:border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between bg-muted/10 border-b px-8 py-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {index + 1}
                </span>
                <CardTitle className="text-lg font-bold text-foreground/80">Chapter Configuration</CardTitle>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeSegment(segment.id)} className="text-destructive hover:bg-destructive/10 rounded-full">
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Title Overlay</label>
                  <Input 
                    className="h-12 text-lg border-2 focus-visible:ring-primary"
                    placeholder="e.g. The Awakening"
                    value={segment.title} 
                    onChange={(e) => updateSegment(segment.id, { title: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Narrative Prose</label>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleAiGenerate(segment.id, segment.title)}
                      disabled={isGenerating === segment.id}
                      className="h-8 text-xs font-bold px-4"
                    >
                      <Sparkles className="w-3 h-3 mr-2" />
                      {isGenerating === segment.id ? 'Generating...' : 'AI Enhance'}
                    </Button>
                  </div>
                  <Textarea 
                    className="text-base border-2 focus-visible:ring-primary leading-relaxed"
                    placeholder="Tell the story of this segment..."
                    rows={6}
                    value={segment.description} 
                    onChange={(e) => updateSegment(segment.id, { description: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                      <LucideImage className="w-3 h-3" /> Static Poster Image (URL)
                    </label>
                    <Input 
                      className="border-2"
                      placeholder="https://images.unsplash.com/..."
                      value={segment.imageUrl} 
                      onChange={(e) => updateSegment(segment.id, { imageUrl: e.target.value })}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                      <Video className="w-3 h-3" /> Interactive Video Path (WebM / MP4)
                    </label>
                    <Input 
                      className="border-2"
                      placeholder="/hero-animation.webm"
                      value={segment.videoUrl || ''} 
                      onChange={(e) => updateSegment(segment.id, { videoUrl: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="aspect-video relative rounded-2xl overflow-hidden bg-muted/30 border-2 border-dashed border-muted-foreground/20 group">
                   {segment.videoUrl ? (
                     <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center gap-2">
                        <Video className="w-10 h-10 text-white/10" />
                        <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Video Linked: {segment.videoUrl}</span>
                     </div>
                   ) : (
                     <img 
                       src={segment.imageUrl} 
                       alt="Preview" 
                       className="object-cover w-full h-full opacity-60 group-hover:scale-105 transition-transform duration-700"
                     />
                   )}
                   <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/10">
                     Source Preview
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {segments.length === 0 && (
        <div className="text-center py-32 border-4 border-dashed border-muted/50 rounded-3xl bg-muted/5">
          <p className="text-muted-foreground mb-6 font-body text-xl">Your narrative journey begins with a single chapter.</p>
          <Button onClick={addSegment} className="h-14 px-10 rounded-full text-lg shadow-xl shadow-primary/10">
            <Plus className="w-5 h-5 mr-3" /> Create Your First Segment
          </Button>
        </div>
      )}
    </div>
  );
}
