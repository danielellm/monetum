'use client';

import type { Film } from '@/lib/types';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import useEmblaCarousel from 'embla-carousel-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import HeroSlide from './hero-slide';
import FilmInfo from './film-info';
import Footer from './footer';
import Header from './header';

type FilmPageClientProps = {
  films: Film[];
  initialSlug: string;
};

const AUTOPLAY_DURATION = 12000; // 12 seconds

export default function FilmPageClient({ films, initialSlug }: FilmPageClientProps) {
  const router = useRouter();
  const initialSlideIndex = useMemo(() => films.findIndex((f) => f.slug === initialSlug), [films, initialSlug]);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    startIndex: initialSlideIndex,
  });
  
  const [activeIndex, setActiveIndex] = useState(initialSlideIndex);
  const [progress, setProgress] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  const activeFilm = films[activeIndex];

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
    setProgress(0);
    setIsInteracting(false);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    emblaApi.on('pointerDown', () => setIsInteracting(true));
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (initialSlideIndex !== -1 && emblaApi) {
      emblaApi.scrollTo(initialSlideIndex, true);
    }
  }, [initialSlideIndex, emblaApi]);

  useEffect(() => {
    const newSlug = films[activeIndex]?.slug;
    if (newSlug && newSlug !== initialSlug) {
      router.push(`/filme/${newSlug}`, { scroll: false });
    }
    if (emblaApi) {
        const nextIndex = (activeIndex + 1) % films.length;
        const prevIndex = (activeIndex - 1 + films.length) % films.length;
        router.prefetch(`/filme/${films[nextIndex].slug}`);
        router.prefetch(`/filme/${films[prevIndex].slug}`);
    }
  }, [activeIndex, films, router, initialSlug, emblaApi]);

  useEffect(() => {
    if (isHovering || isInteracting) return;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          emblaApi?.scrollNext();
          return 0;
        }
        return p + (100 / (AUTOPLAY_DURATION / 100));
      });
    }, 100);
    return () => clearInterval(interval);
  }, [emblaApi, isHovering, isInteracting]);
  
  const scrollPrev = useCallback(() => {
    emblaApi && emblaApi.scrollPrev();
    setIsInteracting(true);
  }, [emblaApi]);
  const scrollNext = useCallback(() => {
    emblaApi && emblaApi.scrollNext();
    setIsInteracting(true);
  }, [emblaApi]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') scrollNext();
      if (e.key === 'ArrowLeft') scrollPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollNext, scrollPrev]);

  if (!activeFilm) {
    return null;
  }

  return (
    <main
      className="bg-background text-foreground"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Header />
      <div className="relative h-screen w-full overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-800 z-20">
            <motion.div
                className="h-full bg-primary"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
            />
        </div>

        <div className="overflow-hidden h-full" ref={emblaRef}>
          <div className="flex h-full">
            {films.map((film, index) => (
              <div className="relative flex-[0_0_100%] h-full" key={film.id}>
                <HeroSlide
                  film={film}
                  isActive={index === activeIndex}
                  isMuted={isHovering || isInteracting}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* New Layout Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end items-center p-8 md:p-12 pointer-events-none bg-gradient-to-t from-black/90 via-transparent">
          <div className="w-full max-w-6xl mx-auto relative h-full">
            
            <div className='absolute top-[25vh] md:top-[20vh] left-0 pointer-events-auto'>
              <span className="text-6xl md:text-8xl font-bold text-primary">{String(activeIndex + 1).padStart(2, '0')}</span>
              <span className="text-2xl md:text-4xl text-gray-500">/{String(films.length).padStart(2, '0')}</span>
            </div>

            <AnimatePresence mode="wait">
                 <motion.div
                    key={activeFilm.id}
                    className="w-full pointer-events-auto absolute bottom-0 left-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="flex flex-col items-start text-left mb-8 md:mb-12">
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-headline">{activeFilm.title}</h1>
                        <div className="flex gap-x-4 md:gap-x-6 mt-4 text-xs md:text-sm text-primary font-mono">
                            <span>{activeFilm.genre}</span>
                            <span>{activeFilm.duration}</span>
                            <span>{activeFilm.language}</span>
                        </div>
                        <div className="mt-6 flex items-center gap-2">
                            <button onClick={scrollPrev} className="pointer-events-auto p-2 text-primary hover:text-white transition-colors border border-primary hover:bg-primary">
                                <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
                            </button>
                             <button onClick={scrollNext} className="pointer-events-auto p-2 text-primary hover:text-white transition-colors border border-primary hover:bg-primary">
                                <ArrowRight className="h-5 w-5 md:h-6 md:w-6" />
                            </button>
                        </div>
                    </div>
                 </motion.div>
            </AnimatePresence>
            </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
            key={activeFilm.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
        >
            <FilmInfo film={activeFilm} />
        </motion.div>
      </AnimatePresence>

      <Footer />
    </main>
  );
}
