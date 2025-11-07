'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

type NavigationArrowsProps = {
  onPrev: () => void;
  onNext: () => void;
};

export default function NavigationArrows({ onPrev, onNext }: NavigationArrowsProps) {
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full text-white/70 hover:text-white hover:bg-white/10"
        onClick={onPrev}
        aria-label="Previous film"
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full text-white/70 hover:text-white hover:bg-white/10"
        onClick={onNext}
        aria-label="Next film"
      >
        <ChevronRight className="h-8 w-8" />
      </Button>
    </>
  );
}
