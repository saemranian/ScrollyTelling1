
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

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const scrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.min(Math.max(scrollY / totalHeight, 0), 1);
      
      setProgress(scrollPercent);
      
      const index = Math.min(
        Math.floor(scrollPercent * segments.length),
        segments.length - 1
      );
      setCurrentIndex(index);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [segments.length]);

  const currentSegment = segments[currentIndex];

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Background Stop-Motion Layer */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        {segments.map((segment, idx) => (
          <div
            key={segment.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              idx === currentIndex ? "opacity-100 scale-100" : "opacity-0 scale-105"
            )}
          >
            <Image
              src={segment.imageUrl}
              alt={segment.title}
              fill
              className="object-cover brightness-[0.85] contrast-[0.9]"
              priority={idx === 0}
            />
          </div>
        ))}
        {/* Vignette/Minimalist Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-background/40" />
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
            key={`section-${segment.id}`}
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

      {/* Initial Scroll Hint */}
      {progress < 0.05 && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-bounce opacity-60">
          <span className="text-sm font-bold tracking-widest uppercase text-muted-foreground">Scroll to Begin</span>
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
