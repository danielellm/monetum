'use client';

import type { Film } from '@/lib/types';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import useEmblaCarousel from 'embla-carousel-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, MoveHorizontal, Github, Twitter, Instagram } from 'lucide-react';

import HeroSlide from './hero-slide';
import FilmInfo from './film-info';
import Footer from './footer';
import Header from './header';
import Gallery from './gallery';

type FilmPageClientProps = {
  films: Film[];
  initialSlug: string;
};

const AUTOPLAY_DURATION = 12000; // 12 seconds

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
  exit: {
    opacity: 1,
  },
};

const titleVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
  },
};

const detailsVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { delay: 0.6, duration: 0.5, ease: [0.22, 1, 0.36, 1] } 
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
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const isTouchDevice = useRef(false);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  
  const autoplayTimer = useRef<NodeJS.Timeout | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const activeFilm = films[activeIndex];
  const nextFilm = films[(activeIndex + 1) % films.length];
  const prevFilm = films[(activeIndex - 1 + films.length) % films.length];

  const attemptToPlayVideo = useCallback((api = emblaApi) => {
    if (!api || !isHeroVisible) return;
    const slides = api.slideNodes();
    slides.forEach((slide, index) => {
        const video = slide?.querySelector('video');
        if (video) {
            const isSlideActive = index === api.selectedScrollSnap();
            if (isSlideActive) {
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.log("Autoplay was prevented by browser.");
                    });
                }
            } else if (!video.paused) {
                video.pause();
            }
        }
    });
  }, [emblaApi, isHeroVisible]);


  const clearAutoplayTimer = useCallback(() => {
    if (autoplayTimer.current) {
      clearInterval(autoplayTimer.current);
      autoplayTimer.current = null;
    }
  }, []);

  const startAutoplay = useCallback(() => {
    clearAutoplayTimer();
    if (!isHeroVisible) return;
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
  }, [clearAutoplayTimer, hasInteracted, isHeroVisible]);

 const handleUserInteraction = useCallback(() => {
    if (!hasInteracted) {
        setHasInteracted(true);
        startAutoplay();
    }
}, [hasInteracted, startAutoplay]);


  useEffect(() => {
    isTouchDevice.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice.current) {
      const hintTimer = setTimeout(() => setShowSwipeHint(true), 500);
      const hideTimer = setTimeout(() => setShowSwipeHint(false), 2500); 
      return () => {
        clearTimeout(hintTimer);
        clearTimeout(hideTimer);
      }
    }
  }, []);
  
  useEffect(() => {
      if (progress >= 100) {
          emblaApi?.scrollNext();
      }
  }, [progress, emblaApi]);
  
  const onInteraction = useCallback((api: any) => {
    if (!api) return;
    handleUserInteraction();
    
    clearAutoplayTimer();
    setProgress(0);
  }, [clearAutoplayTimer, handleUserInteraction]);

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
      if (isHeroVisible) {
        startAutoplay();
      }
    };
    
    const onPointerDown = () => onInteraction(emblaApi);

    emblaApi.on('select', onSelect);
    emblaApi.on('pointerDown', onPointerDown);
    
    if (!isTouchDevice.current) {
      startAutoplay();
    }

    attemptToPlayVideo(emblaApi); 
  
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('pointerDown', onPointerDown);
      clearAutoplayTimer();
    };
  }, [emblaApi, startAutoplay, clearAutoplayTimer, onInteraction, attemptToPlayVideo, isHeroVisible]);

  useEffect(() => {
    const observer = new IntersectionObserver(
        ([entry]) => {
            setIsHeroVisible(entry.isIntersecting);
        },
        { threshold: 0.1 }
    );

    const currentHeroRef = heroRef.current;
    if (currentHeroRef) {
        observer.observe(currentHeroRef);
    }

    return () => {
        if (currentHeroRef) {
            observer.unobserve(currentHeroRef);
        }
    };
  }, []);

  useEffect(() => {
    if (isHeroVisible) {
        attemptToPlayVideo();
        startAutoplay();
    } else {
        clearAutoplayTimer();
        setProgress(0);
        if (emblaApi) {
            emblaApi.slideNodes().forEach(slide => {
                const video = slide.querySelector('video');
                if (video && !video.paused) {
                    video.pause();
                }
            });
        }
    }
  }, [isHeroVisible, startAutoplay, clearAutoplayTimer, emblaApi, attemptToPlayVideo]);

  
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
      onTouchStart={handleUserInteraction}
    >
      <Header />
      <div className="relative h-screen w-full overflow-hidden" ref={heroRef}>
        <div className="absolute top-0 left-0 w-full h-0.5 bg-transparent z-20">
            {(progress > 0 && (!isTouchDevice.current || hasInteracted)) && <motion.div
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
                  isMuted={true}
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
                    animate={{ opacity: [0, 0.5, 0.5, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2.0, times: [0, 0.1, 0.9, 1] }}
                    className="absolute z-30 top-24 left-0 right-0 w-full flex items-center justify-center pointer-events-none"
                >
                    <div className="flex items-center gap-2 bg-black/30 text-white p-2 px-4 rounded-lg backdrop-blur-sm">
                        <MoveHorizontal className="w-5 h-5"/>
                        <span className="text-sm font-light">Swipe to navigate</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <div className="absolute inset-0 z-10 flex flex-col justify-end bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none">
          <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-6 relative h-full flex flex-col justify-end pb-24 md:pb-32">
            
            <div className="w-full">
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
                            <motion.h1 variants={titleVariants} className="text-7xl md:text-[160px] lg:text-[220px] font-bold font-headline leading-none break-words">{activeFilm.title}</motion.h1>
                            <motion.div variants={detailsVariants} className="flex flex-wrap gap-x-4 md:gap-x-6 mt-6 text-xs font-mono uppercase tracking-wider">
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
      
      <AnimatePresence mode="wait">
        <motion.div
            key={`${activeFilm.id}-gallery`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
        >
            {activeFilm.gallery && activeFilm.gallery.length > 0 && (
                <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-16 md:py-24">
                     <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
                    >
                        <Gallery images={activeFilm.gallery} />
                    </motion.div>
                </div>
            )}
        </motion.div>
      </AnimatePresence>

      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 pb-16 md:pb-24">
        <div className="w-full flex justify-between items-center gap-8">
            <motion.button 
                onClick={scrollPrev} 
                className="flex items-center gap-3 text-white hover:text-primary transition-colors group"
                whileHover="hover"
            >
                <motion.div variants={{ hover: { x: -5 } }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
                    <ArrowLeft className="h-6 w-6" />
                </motion.div>
                <div className="overflow-hidden">
                    <motion.div variants={{ hover: { x: 10 } }} transition={{ type: 'spring', stiffness: 400, damping: 15 }} className="group-hover:-translate-x-full">
                        <span className="text-xs text-muted-foreground uppercase tracking-widest">Prev</span>
                        <p className="font-headline text-lg hidden md:block whitespace-nowrap">{prevFilm.title}</p>
                    </motion.div>
                </div>
            </motion.button>
            <motion.button 
                onClick={scrollNext} 
                className="flex flex-row-reverse items-center gap-3 text-white hover:text-primary transition-colors group"
                whileHover="hover"
            >
                <motion.div variants={{ hover: { x: 5 } }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
                    <ArrowRight className="h-6 w-6" />
                </motion.div>
                 <div className="overflow-hidden text-right">
                    <motion.div variants={{ hover: { x: -10 } }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
                        <span className="text-xs text-muted-foreground uppercase tracking-widest">Next</span>
                        <p className="font-headline text-lg hidden md:block whitespace-nowrap">{nextFilm.title}</p>
                    </motion.div>
                </div>
            </motion.button>
        </div>
      </div>

      <div id="contact" className="max-w-screen-2xl mx-auto px-4 md:px-6 pb-16 md:pb-24">
        <div className="w-full flex flex-col items-end gap-y-12">
            <div className="text-right flex flex-col gap-8">
                <div>
                    <h3 className="text-sm text-primary">say hello</h3>
                    <a href="mailto:email@email.de" className="text-white hover:text-primary transition-colors">email_at_email.de</a>
                </div>
                <div>
                    <h3 className="text-sm text-primary">location</h3>
                    <div className="text-white not-italic">
                        <p>MOMENTUM FILM</p>
                        <p>Lindenstr. 114</p>
                        <p>10969 Berlin</p>
                    </div>
                </div>
            </div>
             <div className="flex items-center gap-4">
              <a href="#" aria-label="Instagram" className="text-primary hover:text-primary/80 transition-colors">
                <Instagram />
              </a>
              <a href="#" aria-label="Twitter" className="text-primary hover:text-primary/80 transition-colors">
                <Twitter />
              </a>
              <a href="#" aria-label="Github" className="text-primary hover:text-primary/80 transition-colors">
                <Github />
              </a>
            </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
