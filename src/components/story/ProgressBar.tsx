
"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number; // 0 to 1
  segmentsCount: number;
  currentIndex: number;
}

export function ProgressBar({ progress, segmentsCount, currentIndex }: ProgressBarProps) {
  return (
    <div className="fixed left-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4 items-center">
      <div className="h-64 w-[2px] bg-muted rounded-full relative overflow-hidden">
        <div 
          className="absolute top-0 left-0 w-full bg-primary transition-all duration-300 ease-out"
          style={{ height: `${progress * 100}%` }}
        />
      </div>
      <div className="text-[10px] font-bold text-primary-foreground bg-primary/20 p-1 rounded-sm rotate-90 whitespace-nowrap tracking-widest uppercase">
        {currentIndex + 1} / {segmentsCount}
      </div>
    </div>
  );
}
