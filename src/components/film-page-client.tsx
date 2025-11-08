'use client';

import type { Film } from '@/lib/types';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import useEmblaCarousel from 'embla-carousel-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, MoveHorizontal } from 'lucide-react';

import HeroSlide from './hero-slide';
import FilmInfo from './film-info';
import Footer from './footer';
import Header from './header';

type FilmPageClientProps = {
  films: Film[];
  initialSlug: string;
};

const AUTOPLAY_DURATION = 12000; // 12 seconds

const containerVariants = {
  hidden: { opacity: 1 }, // Keep container visible
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3, // Delay before any children animations start
      staggerChildren: 0.2, // Stagger the animation of children (title, then details)
    },
  },
  exit: {
    opacity: 1, // Keep container visible
    transition: {
      duration: 0.3,
    },
  },
};

const titleVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
  },
};

const detailsVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } 
  },
};


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
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const isTouchDevice = useRef(false);
  
  const autoplayTimer = useRef<NodeJS.Timeout | null>(null);

  const activeFilm = films[activeIndex];

  const attemptToPlayVideo = useCallback((api = emblaApi) => {
    if (!api) return;
    const slides = api.slideNodes();
    slides.forEach((slide, index) => {
        const video = slide?.querySelector('video');
        if (video) {
            const isSlideActive = index === api.selectedScrollSnap();
            const playPromise = video.play();

            if (isSlideActive) {
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        // Autoplay was prevented. This is expected on mobile before interaction.
                        // We'll rely on the user interaction handler to trigger play.
                        console.log("Autoplay was prevented by browser.");
                    });
                }
            } else if (!video.paused) {
                video.pause();
            }
        }
    });
  }, [emblaApi]);


  const clearAutoplayTimer = useCallback(() => {
    if (autoplayTimer.current) {
      clearInterval(autoplayTimer.current);
      autoplayTimer.current = null;
    }
  }, []);

  const startAutoplay = useCallback(() => {
    clearAutoplayTimer();
    if (isHovering) return;
    if (isTouchDevice.current && !hasInteracted) return;

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
  }, [clearAutoplayTimer, isHovering, hasInteracted]);

 const handleUserInteraction = useCallback(() => {
    if (!hasInteracted) {
        setHasInteracted(true);
        
        // This is the key for mobile autoplay.
        // Once the user interacts, we try to play the current video.
        if (emblaApi) {
            const slides = emblaApi.slideNodes();
            const currentSlide = slides[emblaApi.selectedScrollSnap()];
            const video = currentSlide?.querySelector('video');
            if (video && video.paused) {
                video.play().catch(e => console.log("Still couldn't play after interaction."));
            }
        }
        startAutoplay(); // And start the timer logic.
    }
}, [hasInteracted, emblaApi, startAutoplay]);


  // Check for touch device on mount
  useEffect(() => {
    isTouchDevice.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice.current) {
      setShowSwipeHint(true);
      const timer = setTimeout(() => setShowSwipeHint(false), 2000); // Show hint for 2 seconds
      return () => clearTimeout(timer);
    }
  }, []);
  
  useEffect(() => {
      if (progress >= 100) {
          emblaApi?.scrollNext();
      }
  }, [progress, emblaApi]);
  
  const onInteraction = useCallback((api) => {
    if (!api) return;
    if (!hasInteracted) {
      handleUserInteraction();
    }
    
    clearAutoplayTimer();
    setProgress(0);
    const restartTimer = setTimeout(startAutoplay, 5000); 
    return () => clearTimeout(restartTimer);
  }, [clearAutoplayTimer, startAutoplay, handleUserInteraction, hasInteracted]);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);
  
  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);
  
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      const newIndex = emblaApi.selectedScrollSnap();
      setActiveIndex(newIndex);
      setProgress(0);
      attemptToPlayVideo(emblaApi);
       if (!isHovering) {
        startAutoplay();
      }
    };
    
    const onPointerDown = () => {
      onInteraction(emblaApi);
    };

    emblaApi.on('select', onSelect);
    emblaApi.on('pointerDown', onPointerDown);
    
    // Start autoplay immediately on desktop
    if (!isTouchDevice.current) {
        startAutoplay();
    }

    attemptToPlayVideo(emblaApi); 
  
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
       if (!isTouchDevice.current || hasInteracted) {
         startAutoplay();
       }
    }
  }, [isHovering, startAutoplay, clearAutoplayTimer, hasInteracted]);
  
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
      onMouseEnter={() => { if(!isTouchDevice.current && !isHovering) setIsHovering(true); }}
      onMouseLeave={() => { if(!isTouchDevice.current && isHovering) setIsHovering(false); }}
      onTouchStart={handleUserInteraction}
    >
      <Header />
      <div className="relative h-screen w-full overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-transparent z-20">
            {progress > 0 && <motion.div
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
                  isMuted={!isHovering && (!isTouchDevice.current || hasInteracted)}
                  hasInteracted={hasInteracted}
                />
              </div>
            ))}
          </div>
        </div>
        
        <AnimatePresence>
            {showSwipeHint && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: [0, 0.7, 0.7, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2.2, times: [0, 0.1, 0.9, 1] }}
                    className="absolute z-30 top-24 left-0 right-0 flex items-center justify-center pointer-events-none"
                >
                    <div className="flex items-center gap-2 bg-black/20 text-white p-2 px-4 rounded-lg backdrop-blur-sm">
                        <MoveHorizontal className="w-5 h-5"/>
                        <span className="text-sm font-light">Swipe to navigate</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <div className="absolute inset-0 z-10 flex flex-col justify-end bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none">
          <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-6 relative h-full flex flex-col justify-end pb-24 md:pb-32">
            
            <div className="w-full pointer-events-auto">
                <div className='self-start mb-4'>
                    <span className="text-xl md:text-2xl text-primary font-normal">{String(activeIndex + 1).padStart(2, '0')}</span>
                    <span className="text-sm md:text-base text-gray-500">/{String(films.length).padStart(2, '0')}</span>
                </div>

                <AnimatePresence mode="wait">
                     <motion.div
                        key={activeFilm.id}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="w-full"
                      >
                        <div className="flex flex-col items-start text-left max-w-none">
                            <motion.h1 variants={titleVariants} className="text-7xl md:text-[160px] lg:text-[220px] font-bold font-headline leading-none break-words pointer-events-none">{activeFilm.title}</motion.h1>
                            <motion.div variants={detailsVariants} className="flex flex-wrap gap-x-4 md:gap-x-6 mt-6 text-xs font-mono uppercase tracking-wider pointer-events-none">
                               <p><span className="text-muted-foreground">Genre</span> / <span className="text-foreground">{activeFilm.genre}</span></p>
                               <p><span className="text-muted-foreground">Dauer</span> / <span className="text-foreground">{activeFilm.duration}</span></p>
                               <p><span className="text-muted-foreground">Sprache</span> / <span className="text-foreground">{activeFilm.language}</span></p>
                            </motion.div>
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
 
