'use client';

import type { Film } from '@/lib/types';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

export default function FilmPageClient({ films: unsortedFilms, initialSlug }: FilmPageClientProps) {
  const router = useRouter();
  
  const films = useMemo(() => 
    [...unsortedFilms].sort((a, b) => a.slider_position - b.slider_position),
    [unsortedFilms]
  );

  const initialSlideIndex = useMemo(() => {
    const index = films.findIndex((f) => f.slug === initialSlug);
    return index >= 0 ? index : 0;
  }, [films, initialSlug]);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    startIndex: initialSlideIndex,
  });
  
  const [activeIndex, setActiveIndex] = useState(initialSlideIndex);
  const [progress, setProgress] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const autoplayTimer = useRef<NodeJS.Timeout | null>(null);

  const activeFilm = films[activeIndex];

  const attemptToPlayVideo = useCallback((api = emblaApi) => {
    if (!api) return;
    const slides = api.slideNodes();
    slides.forEach((slide, index) => {
        const video = slide?.querySelector('video');
        if (video) {
            if (index === api.selectedScrollSnap()) {
                video.play().catch(err => {
                  // Autoplay was prevented. This is expected on mobile.
                  // The user will need to interact to start the video.
                });
            } else {
                video.pause();
            }
        }
    });
  }, [emblaApi]);
  
  const handleUserInteraction = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true);
      // Attempt to play all videos now that we have user interaction
      document.querySelectorAll('video').forEach(vid => {
        vid.play().catch(err => console.log('Play after interaction failed.'));
      });
      attemptToPlayVideo(); 
    }
  }, [hasInteracted, attemptToPlayVideo]);

  // Listen for the first user interaction
  useEffect(() => {
    if (hasInteracted) return;
    
    const events: (keyof WindowEventMap)[] = ['scroll', 'click', 'touchstart', 'keydown'];
    events.forEach(event => window.addEventListener(event, handleUserInteraction, { once: true }));

    return () => {
      events.forEach(event => window.removeEventListener(event, handleUserInteraction));
    };
  }, [hasInteracted, handleUserInteraction]);

  const clearAutoplayTimer = useCallback(() => {
    if (autoplayTimer.current) {
      clearInterval(autoplayTimer.current);
      autoplayTimer.current = null;
    }
  }, []);

  const startAutoplay = useCallback(() => {
    clearAutoplayTimer();
    // No autoplay on touch devices or if hovering
    if (isHovering || 'ontouchstart' in window) return;

    setProgress(0);
    const timer = setInterval(() => {
        setProgress(prev => {
            if (prev >= 100) {
                return 100;
            }
            return prev + (100 / (AUTOPLAY_DURATION / 100));
        });
    }, 100);
    autoplayTimer.current = timer;
  }, [clearAutoplayTimer, isHovering]);

  useEffect(() => {
      if (progress >= 100) {
          emblaApi?.scrollNext();
      }
  }, [progress, emblaApi]);
  
  const onInteraction = useCallback(() => {
    if (!emblaApi) return;
    handleUserInteraction();
    
    clearAutoplayTimer();
    setProgress(0);
    const restartTimer = setTimeout(startAutoplay, 5000); 
    return () => clearTimeout(restartTimer);
  }, [emblaApi, clearAutoplayTimer, startAutoplay, handleUserInteraction]);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
    onInteraction();
  }, [emblaApi, onInteraction]);
  
  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
    onInteraction();
  }, [emblaApi, onInteraction]);
  
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      const newIndex = emblaApi.selectedScrollSnap();
      setActiveIndex(newIndex);
      setProgress(0);
      if (!isHovering) {
        startAutoplay();
      }
      if (hasInteracted || !('ontouchstart' in window)) {
        attemptToPlayVideo(emblaApi);
      }
    };
    
    const onPointerDown = () => {
      onInteraction();
    };

    emblaApi.on('select', onSelect);
    emblaApi.on('pointerDown', onPointerDown);

    startAutoplay();
    if (hasInteracted || !('ontouchstart' in window)) {
      attemptToPlayVideo(emblaApi); 
    }
  
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('pointerDown', onPointerDown);
      clearAutoplayTimer();
    };
  }, [emblaApi, isHovering, startAutoplay, clearAutoplayTimer, onInteraction, attemptToPlayVideo, hasInteracted]);

  useEffect(() => {
    if (isHovering) {
        clearAutoplayTimer();
        setProgress(0);
    } else {
        startAutoplay();
    }
  }, [isHovering, clearAutoplayTimer, startAutoplay]);
  
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
      onMouseEnter={() => { if(!isHovering) setIsHovering(true); }}
      onMouseLeave={() => { if(isHovering) setIsHovering(false); }}
      onTouchStart={handleUserInteraction}
    >
      <Header />
      <div className="relative h-screen w-full overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-transparent z-20">
            {!isHovering && progress > 0 && <motion.div
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
                  isMuted={!isHovering}
                  hasInteracted={hasInteracted}
                />
              </div>
            ))}
          </div>
        </div>
        
        <div className="absolute inset-0 z-10 flex flex-col justify-end bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none">
          <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-6 relative h-full flex flex-col justify-end pb-24 md:pb-32">
            
            <div className="w-full pointer-events-none">
                <AnimatePresence>
                  <motion.div
                    key={`counter-${activeFilm.id}`}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.8 } }}
                    exit={{ opacity: 0 }}
                    className='self-start mb-4'>
                    <span className="text-xl md:text-2xl text-primary font-normal">{String(activeIndex + 1).padStart(2, '0')}</span>
                    <span className="text-sm md:text-base text-gray-500">/{String(films.length).padStart(2, '0')}</span>
                  </motion.div>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                     <motion.div
                        key={activeFilm.id}
                        className="w-full"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="flex flex-col items-start text-left max-w-none">
                            <h1 className="text-7xl md:text-[160px] lg:text-[220px] font-bold font-headline leading-none break-words">{activeFilm.title}</h1>
                            <div className="flex flex-wrap gap-x-4 md:gap-x-6 mt-6 text-xs font-mono uppercase tracking-wider">
                               <p><span className="text-muted-foreground">Genre</span> / <span className="text-foreground">{activeFilm.genre}</span></p>
                               <p><span className="text-muted-foreground">Dauer</span> / <span className="text-foreground">{activeFilm.duration}</span></p>
                               <p><span className="text-muted-foreground">Sprache</span> / <span className="text-foreground">{activeFilm.language}</span></p>
                            </div>
                        </div>
                     </motion.div>
                </AnimatePresence>
            </div>
            
            <div className="flex items-center gap-4 mt-16 pointer-events-auto">
                <motion.button 
                    onClick={scrollPrev} 
                    className="p-2 text-white hover:text-primary transition-colors group"
                    whileHover="hover"
                >
                    <motion.div variants={{ hover: { x: -5 } }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
                        <ArrowLeft className="h-6 w-6 md:h-7 md:w-7" />
                    </motion.div>
                </motion.button>
                    <motion.button 
                    onClick={scrollNext} 
                    className="p-2 text-white hover:text-primary transition-colors group"
                    whileHover="hover"
                >
                    <motion.div variants={{ hover: { x: 5 } }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
                        <ArrowRight className="h-6 w-6 md:h-7 md:w-7" />
                    </motion.div>
                </motion.button>
            </div>

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
