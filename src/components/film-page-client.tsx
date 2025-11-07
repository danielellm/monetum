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
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const activeFilm = films[activeIndex];

  const clearAutoplayTimer = useCallback(() => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    setProgress(0);
  }, [timer]);

  const startAutoplay = useCallback(() => {
    clearAutoplayTimer();
    const newTimer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          emblaApi?.scrollNext();
          return 0;
        }
        return p + (100 / (AUTOPLAY_DURATION / 100));
      });
    }, 100);
    setTimer(newTimer);
  }, [emblaApi, clearAutoplayTimer]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
    if (!isHovering && !isInteracting) {
      startAutoplay();
    } else {
      clearAutoplayTimer();
    }
  }, [emblaApi, isHovering, isInteracting, startAutoplay, clearAutoplayTimer]);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
    setIsInteracting(true);
    clearAutoplayTimer();
  }, [emblaApi, clearAutoplayTimer]);
  
  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
    setIsInteracting(true);
    clearAutoplayTimer();
  }, [emblaApi, clearAutoplayTimer]);

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on('select', onSelect);
    emblaApi.on('pointerDown', () => {
      setIsInteracting(true);
      clearAutoplayTimer();
    });
    emblaApi.on('settle', () => {
      setIsInteracting(false);
      if (!isHovering) {
        startAutoplay();
      }
    });

    return () => {
      emblaApi.off('select', onSelect);
      clearAutoplayTimer();
    };
  }, [emblaApi, onSelect, isHovering, startAutoplay, clearAutoplayTimer]);

  useEffect(() => {
    if (initialSlideIndex !== -1 && emblaApi) {
      emblaApi.scrollTo(initialSlideIndex, true);
    }
  }, [initialSlideIndex, emblaApi]);

  useEffect(() => {
    const newSlug = films[activeIndex]?.slug;
    if (newSlug && window.location.pathname !== `/filme/${newSlug}`) {
      window.history.pushState({}, '', `/filme/${newSlug}`);
    }
    if (emblaApi) {
        const nextIndex = (activeIndex + 1) % films.length;
        const prevIndex = (activeIndex - 1 + films.length) % films.length;
        router.prefetch(`/filme/${films[nextIndex].slug}`);
        router.prefetch(`/filme/${films[prevIndex].slug}`);
    }
  }, [activeIndex, films, router, emblaApi]);

  useEffect(() => {
    if (!isHovering && !isInteracting) {
      startAutoplay();
    } else {
      clearAutoplayTimer();
    }
    
    return () => clearAutoplayTimer();
  }, [isHovering, isInteracting, startAutoplay, clearAutoplayTimer]);
  
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
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-800 z-20">
            {(progress > 0) && <motion.div
                className="h-full bg-primary"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
            />}
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
        
        <div className="absolute inset-0 z-10 flex flex-col justify-end items-center p-8 md:p-12 pointer-events-none bg-gradient-to-t from-black/95 via-black/70 to-transparent">
          <div className="w-full max-w-6xl mx-auto relative h-full flex flex-col justify-center">
            
            <AnimatePresence>
              <motion.div
                key={`counter-${activeFilm.id}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.8 } }}
                exit={{ opacity: 0 }}
                className='pointer-events-auto self-start mb-6'>
                <span className="text-2xl md:text-3xl font-normal text-primary">{String(activeIndex + 1).padStart(2, '0')}</span>
                <span className="text-base md:text-lg text-gray-500">/{String(films.length).padStart(2, '0')}</span>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
                 <motion.div
                    key={activeFilm.id}
                    className="w-full pointer-events-auto"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="flex flex-col items-start text-left max-w-none">
                        <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold font-headline leading-none break-words">{activeFilm.title}</h1>
                        <div className="flex flex-wrap gap-x-4 md:gap-x-6 mt-6 text-xs font-mono uppercase tracking-wider">
                            <p><span className="text-muted-foreground">Genre</span> / <span className="text-foreground">{activeFilm.genre}</span></p>
                            <p><span className="text-muted-foreground">Dauer</span> / <span className="text-foreground">{activeFilm.duration}</span></p>
                            <p><span className="text-muted-foreground">Sprache</span> / <span className="text-foreground">{activeFilm.language}</span></p>
                        </div>
                        <div className="mt-8 flex items-center gap-4">
                            <motion.button 
                                onClick={scrollPrev} 
                                className="pointer-events-auto p-2 text-primary hover:text-white transition-colors group"
                                whileHover="hover"
                            >
                                <motion.div variants={{ hover: { x: -5 } }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
                                    <ArrowLeft className="h-6 w-6 md:h-7 md:w-7" />
                                </motion.div>
                            </motion.button>
                             <motion.button 
                                onClick={scrollNext} 
                                className="pointer-events-auto p-2 text-primary hover:text-white transition-colors group"
                                whileHover="hover"
                            >
                                <motion.div variants={{ hover: { x: 5 } }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
                                    <ArrowRight className="h-6 w-6 md:h-7 md:w-7" />
                                </motion.div>
                            </motion.button>
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
