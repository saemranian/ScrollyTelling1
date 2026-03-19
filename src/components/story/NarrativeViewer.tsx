
"use client";

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { StorySegment } from './StoryTypes';
import { ProgressBar } from './ProgressBar';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface NarrativeViewerProps {
  segments: StorySegment[];
}

export function NarrativeViewer({ segments }: NarrativeViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !segments || segments.length === 0) return;
      
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const totalHeight = document.documentElement.scrollHeight - windowHeight;
      
      // Avoid division by zero if page is not scrollable
      if (totalHeight <= 0) return;

      const scrollPercent = Math.min(Math.max(scrollY / totalHeight, 0), 1);
      
      setProgress(scrollPercent);
      
      // Determine current segment index safely
      const index = Math.max(0, Math.min(
        Math.floor(scrollPercent * segments.length),
        segments.length - 1
      ));
      
      setCurrentIndex(index);

      // Stop-motion scrubbing logic
      const activeSegment = segments[index];
      if (!activeSegment) return;

      const segmentPortion = 1 / segments.length;
      const segmentStartPercent = index * segmentPortion;
      const localProgress = (scrollPercent - segmentStartPercent) / segmentPortion;
      const clampedLocalProgress = Math.min(Math.max(localProgress, 0), 1);

      const video = videoRefs.current[activeSegment.id];
      if (video && video.duration && !isNaN(video.duration)) {
        video.currentTime = video.duration * clampedLocalProgress;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial call to set state
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [segments]);

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
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        {segments.map((segment, idx) => (
          <div
            key={segment.id || `segment-${idx}`}
            className={cn(
              "absolute inset-0 transition-opacity duration-700 ease-in-out",
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
                className="w-full h-full object-cover brightness-[0.7] contrast-[0.9]"
              />
            ) : segment.imageUrl ? (
              <Image
                src={segment.imageUrl || 'https://picsum.photos/seed/placeholder/1200/800'}
                alt={segment.title || 'Narrative Scene'}
                fill
                className="object-cover brightness-[0.85] contrast-[0.9]"
                priority={idx === 0}
                unoptimized={segment.imageUrl?.startsWith('data:')}
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <p className="text-muted-foreground text-xs uppercase tracking-widest">No Media</p>
              </div>
            )}
          </div>
        ))}
        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-background/60" />
      </div>

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
            className="h-screen flex items-center justify-center px-6 md:px-24 lg:px-48"
          >
            <div className={cn(
              "max-w-2xl text-center md:text-left narrative-overlay",
              idx === currentIndex ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}>
              <h2 className="text-4xl md:text-6xl font-headline font-bold mb-6 text-primary drop-shadow-sm">
                {segment.title}
              </h2>
              <p className="text-xl md:text-2xl leading-relaxed text-foreground/90 font-body">
                {segment.description}
              </p>
            </div>
          </section>
        ))}
      </div>

      {/* Scroll Hint */}
      {progress < 0.02 && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-bounce opacity-60">
          <span className="text-sm font-bold tracking-widest uppercase text-muted-foreground">Scroll to Begin</span>
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
