'use client';

import type { Film } from '@/lib/types';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import useEmblaCarousel from 'embla-carousel-react';
import { motion, AnimatePresence } from 'framer-motion';

import HeroSlide from './hero-slide';
import FilmInfo from './film-info';
import Footer from './footer';
import NavigationArrows from './navigation-arrows';

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
      // Update URL without full reload and without scrolling to top
      router.push(`/filme/${newSlug}`, { scroll: false });
    }
    // Preload next and previous films
    if (emblaApi) {
        const nextIndex = (activeIndex + 1) % films.length;
        const prevIndex = (activeIndex - 1 + films.length) % films.length;
        router.prefetch(`/filme/${films[nextIndex].slug}`);
        router.prefetch(`/filme/${films[prevIndex].slug}`);
    }

  }, [activeIndex, films, router, initialSlug, emblaApi]);

  // Autoplay progress effect
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
  
  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') scrollNext();
      if (e.key === 'ArrowLeft') scrollPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollNext, scrollPrev]);

  if (!activeFilm) {
    return null; // Or a not found component
  }

  return (
    <main
      className="bg-background text-foreground"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
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

        <div className="absolute inset-0 z-10 flex flex-col justify-end p-8 md:p-12 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none">
            <AnimatePresence mode="wait">
                 <motion.div
                    key={activeFilm.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-sm tracking-widest uppercase text-gray-300">{activeFilm.subtitle}</h2>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-headline mt-2">{activeFilm.title}</h1>
                 </motion.div>
            </AnimatePresence>
            <div className="mt-4 text-xs font-mono">{`${activeIndex + 1} / ${films.length}`}</div>
        </div>

        <NavigationArrows onPrev={scrollPrev} onNext={scrollNext} />
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
