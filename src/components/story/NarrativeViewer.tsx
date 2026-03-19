
"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { StorySegment } from './StoryTypes';
import { ProgressBar } from './ProgressBar';
import { cn } from '@/lib/utils';
import { ChevronDown, Loader2 } from 'lucide-react';

interface NarrativeViewerProps {
  segments: StorySegment[];
}

export function NarrativeViewer({ segments }: NarrativeViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const handleScroll = useCallback(() => {
    if (!segments || segments.length === 0) return;
    
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const totalHeight = document.documentElement.scrollHeight - windowHeight;
    
    if (totalHeight <= 0) return;

    const scrollPercent = Math.min(Math.max(scrollY / totalHeight, 0), 1);
    setProgress(scrollPercent);
    
    // Determine current segment index
    const segmentPortion = 1 / segments.length;
    const index = Math.max(0, Math.min(
      Math.floor(scrollPercent * segments.length),
      segments.length - 1
    ));
    
    setCurrentIndex(index);

    // Stop-motion scrubbing logic
    const activeSegment = segments[index];
    if (activeSegment && activeSegment.id) {
      const segmentStartPercent = index * segmentPortion;
      const localProgress = (scrollPercent - segmentStartPercent) / segmentPortion;
      const clampedLocalProgress = Math.min(Math.max(localProgress, 0), 1);

      const video = videoRefs.current[activeSegment.id];
      if (video && video.duration && !isNaN(video.duration)) {
        // Use requestAnimationFrame for high-performance frame scrubbing
        requestAnimationFrame(() => {
          if (video) {
            video.currentTime = video.duration * clampedLocalProgress;
          }
        });
      }
    }
  }, [segments]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    // Ensure we mark as ready after a fallback timeout
    const timer = setTimeout(() => setIsReady(true), 2000);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, [handleScroll]);

  const handleMetadataLoaded = () => {
    setIsReady(true);
    handleScroll();
  };

  if (!segments || segments.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 bg-card rounded-xl shadow-sm border">
          <p className="text-muted-foreground mb-4">No narrative segments found.</p>
          <p className="text-sm">Go to the Editor to add your first story chapter.</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Background Media Layer */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        {/* Subtle animated background gradient to show through transparent videos */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#fdfbfb_0%,#ebedee_100%)] opacity-50" />
        
        {segments.map((segment, idx) => (
          <div
            key={segment.id || `segment-${idx}`}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out flex items-center justify-center",
              idx === currentIndex ? "opacity-100 scale-100" : "opacity-0 scale-105"
            )}
          >
            {segment.videoUrl ? (
              <video
                ref={(el) => { if (segment.id) videoRefs.current[segment.id] = el; }}
                src={segment.videoUrl}
                muted
                playsInline
                preload="auto"
                onLoadedMetadata={handleMetadataLoaded}
                // Removing background-black to allow alpha transparency to show through
                className="w-full h-full object-contain"
              />
            ) : segment.imageUrl ? (
              <Image
                src={segment.imageUrl}
                alt={segment.title || 'Narrative Scene'}
                fill
                className="object-cover brightness-[0.9]"
                priority={idx === 0}
                unoptimized={segment.imageUrl?.startsWith('data:')}
              />
            ) : (
              <div className="w-full h-full bg-muted/20 flex items-center justify-center">
                <p className="text-muted-foreground text-xs uppercase tracking-widest">No Media</p>
              </div>
            )}
          </div>
        ))}
        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/20 pointer-events-none" />
      </div>

      {!isReady && (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Initializing Scene...</p>
        </div>
      )}

      <ProgressBar 
        progress={progress} 
        segmentsCount={segments.length} 
        currentIndex={currentIndex} 
      />

      {/* Narrative Text Overlay Sections */}
      <div className="relative z-10">
        {segments.map((segment, idx) => (
          <section
            key={`section-${segment.id || idx}`}
            className="h-[200vh] flex items-center justify-center px-6 md:px-24"
          >
            <div className={cn(
              "max-w-4xl text-center narrative-overlay",
              idx === currentIndex ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
            )}>
              <h2 className="text-6xl md:text-9xl font-headline font-bold mb-10 text-primary/90 drop-shadow-sm transition-all duration-1000">
                {segment.title}
              </h2>
              <div className="bg-white/40 backdrop-blur-xl p-10 rounded-3xl border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
                <p className="text-2xl md:text-4xl leading-relaxed text-foreground/80 font-body font-medium">
                  {segment.description}
                </p>
              </div>
            </div>
          </section>
        ))}
        {/* Extra spacer to ensure the last segment can be fully explored */}
        <div className="h-[50vh]" />
      </div>

      {/* Scroll Hint */}
      {progress < 0.01 && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-bounce opacity-60">
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary">Begin Exploration</span>
          <ChevronDown className="w-5 h-5 text-primary" />
        </div>
      )}
    </div>
  );
}
