'use client';

import type { SliderItem, Film } from '@/lib/types';
import { isFilm } from '@/lib/types';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, MoveHorizontal, Github, Twitter, Instagram } from 'lucide-react';

import HeroSlide from './hero-slide';
import FilmInfo from './film-info';
import Footer from './footer';
import Header from './header';
import Gallery from './gallery';
import useEmblaCarousel from 'embla-carousel-react';

type FilmPageClientProps = {
  sliderItems: SliderItem[];
  initialSlug: string;
};

const AUTOPLAY_DURATION = 12000; // 12 seconds

export default function FilmPageClient({ sliderItems, initialSlug }: FilmPageClientProps) {
  const router = useRouter();
  
  const filmsOnly = useMemo(() => sliderItems.filter(isFilm), [sliderItems]);

  const initialSlideIndex = useMemo(() => {
    const index = sliderItems.findIndex((f) => f.slug === initialSlug);
    return index >= 0 ? index : 0;
  }, [sliderItems, initialSlug]);
  
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

  const activeItem = sliderItems[activeIndex];
  const nextItem = sliderItems[(activeIndex + 1) % sliderItems.length];
  const prevItem = sliderItems[(activeIndex - 1 + sliderItems.length) % sliderItems.length];

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
    if (!isHeroVisible || !isFilm(activeItem)) return; // No autoplay on "About Us"
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
  }, [clearAutoplayTimer, hasInteracted, isHeroVisible, activeItem]);

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
      if (progress >= 100 && isFilm(activeItem)) {
          emblaApi?.scrollNext();
      }
  }, [progress, emblaApi, activeItem]);
  
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
    const newSlug = sliderItems[activeIndex]?.slug;
    const isAboutPage = newSlug === 'about-us';
    const currentPath = window.location.pathname;
    const newPath = isAboutPage ? '/about-us' : `/filme/${newSlug}`;

    if (newSlug && currentPath !== newPath) {
      window.history.pushState({}, '', newPath);
    }
    if (emblaApi) {
        const nextIndex = (activeIndex + 1) % sliderItems.length;
        const prevIndex = (activeIndex - 1 + sliderItems.length) % sliderItems.length;
        const nextSlug = sliderItems[nextIndex].slug;
        const prevSlug = sliderItems[prevIndex].slug;
        router.prefetch(nextSlug === 'about-us' ? '/about-us' : `/filme/${nextSlug}`);
        router.prefetch(prevSlug === 'about-us' ? '/about-us' : `/filme/${prevSlug}`);
    }
  }, [activeIndex, sliderItems, router, emblaApi]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') scrollNext();
      if (e.key === 'ArrowLeft') scrollPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollNext, scrollPrev]);

  if (!activeItem) {
    return null;
  }

  const activeIsFilm = isFilm(activeItem);

  return (
    <main
      className="bg-background text-foreground"
      onTouchStart={handleUserInteraction}
    >
      <Header films={filmsOnly} />
      <div className="relative h-screen w-full overflow-hidden" ref={heroRef}>
        <div className="absolute top-0 left-0 w-full h-0.5 bg-transparent z-20">
            {(progress > 0 && (!isTouchDevice.current || hasInteracted)) && <div
                className="h-full bg-primary"
                style={{ width: `${progress}%` }}
            />}
        </div>

        <div className="overflow-hidden h-full" ref={emblaRef}>
          <div className="flex h-full">
            {sliderItems.map((item, index) => (
              <div className="relative flex-[0_0_100%] h-full" key={item.id}>
                <HeroSlide
                  item={item}
                  isActive={index === activeIndex}
                  isMuted={true}
                  hasInteracted={hasInteracted}
                />
              </div>
            ))}
          </div>
        </div>
        
        {showSwipeHint && (
            <div
                className="absolute z-30 top-24 left-0 right-0 w-full flex items-center justify-center pointer-events-none opacity-50"
            >
                <div className="flex items-center gap-2 bg-black/30 text-white p-2 px-4 rounded-lg backdrop-blur-sm">
                    <MoveHorizontal className="w-5 h-5"/>
                    <span className="text-sm font-light">Swipe to navigate</span>
                </div>
            </div>
        )}

        <div className="absolute inset-0 z-10 flex flex-col justify-end bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none">
          <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-6 relative h-full flex flex-col justify-end pb-24 md:pb-32">
            
            <div className="w-full">
                <div className='self-start mb-4'>
                    {activeIsFilm ? (
                      <>
                        <span className="text-xl md:text-2xl text-primary font-normal">{String(filmsOnly.findIndex(f => f.id === activeItem.id) + 1).padStart(2, '0')}</span>
                        <span className="text-sm md:text-base text-gray-500">/{String(filmsOnly.length).padStart(2, '0')}</span>
                      </>
                    ) : (
                      <span className="text-xl md:text-2xl text-primary font-normal lowercase">about us</span>
                    )}
                </div>

                 <div
                    key={activeItem.id}
                    className="w-full"
                  >
                    <div className="flex flex-col items-start text-left max-w-none">
                        <h1 className="text-7xl md:text-[160px] lg:text-[220px] font-bold font-headline leading-none break-words">{activeItem.title}</h1>
                        <div className="flex flex-wrap gap-x-4 md:gap-x-6 mt-6 text-xs font-mono uppercase tracking-wider">
                            {activeIsFilm ? (
                              <>
                                 <p><span className="text-muted-foreground">Genre</span> / <span className="text-foreground">{activeItem.genre}</span></p>
                                 <p><span className="text-muted-foreground">Dauer</span> / <span className="text-foreground">{activeItem.duration}</span></p>
                                 <p><span className="text-muted-foreground">Sprache</span> / <span className="text-foreground">{activeItem.language}</span></p>
                              </>
                            ) : (
                              <div className="opacity-0">
                                 <p><span className="text-muted-foreground">Genre</span> / <span>&nbsp;</span></p>
                              </div>
                            )}
                        </div>
                    </div>
                 </div>
            </div>
            
            <div className="flex items-center gap-4 mt-16 pointer-events-auto">
                <button 
                    onClick={scrollPrev} 
                    className="p-2 text-white hover:text-primary transition-colors group"
                >
                    <div className="group-hover:-translate-x-1 transition-transform">
                        <ArrowLeft className="h-6 w-6 md:h-7 md:w-7" />
                    </div>
                </button>
                <button 
                    onClick={scrollNext} 
                    className="p-2 text-white hover:text-primary transition-colors group"
                >
                    <div className="group-hover:translate-x-1 transition-transform">
                        <ArrowRight className="h-6 w-6 md:h-7 md:w-7" />
                    </div>
                </button>
            </div>

          </div>
        </div>
      </div>

      <div>
        <div key={activeItem.id}>
          {activeIsFilm && <FilmInfo film={activeItem} />}
          {!activeIsFilm && (
             <div className="bg-background py-16 md:py-24">
                <div className="max-w-screen-2xl mx-auto px-4 md:px-6">
                    <div>
                        <div
                            className="prose prose-invert prose-p:text-gray-300 prose-headings:font-headline text-lg max-w-4xl"
                            dangerouslySetInnerHTML={{ __html: activeItem.description }}
                        />
                    </div>
                </div>
             </div>
          )}
        </div>
      </div>
      
      <div key={`${activeItem.id}-gallery`}>
        {activeIsFilm && activeItem.gallery && activeItem.gallery.length > 0 && (
            <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-16 md:py-24">
                 <div>
                    <Gallery images={activeItem.gallery} />
                </div>
            </div>
        )}
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 pb-16 md:pb-24">
        <div className="w-full flex justify-between items-center gap-8">
            <button 
                onClick={scrollPrev} 
                className="flex items-center gap-3 text-white hover:text-primary transition-colors group"
            >
                <div className="group-hover:-translate-x-1 transition-transform">
                    <ArrowLeft className="h-6 w-6" />
                </div>
                <div className="overflow-hidden">
                    <div className="transition-transform">
                        <span className="text-xs text-muted-foreground uppercase tracking-widest">Prev</span>
                        <p className="font-headline text-lg hidden md:block whitespace-nowrap">{prevItem.title}</p>
                    </div>
                </div>
            </button>
            <button 
                onClick={scrollNext} 
                className="flex flex-row-reverse items-center gap-3 text-white hover:text-primary transition-colors group"
            >
                <div className="group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="h-6 w-6" />
                </div>
                 <div className="overflow-hidden text-right">
                    <div className="transition-transform">
                        <span className="text-xs text-muted-foreground uppercase tracking-widest">Next</span>
                        <p className="font-headline text-lg hidden md:block whitespace-nowrap">{nextItem.title}</p>
                    </div>
                </div>
            </button>
        </div>
      </div>

      <div id="contact" className="max-w-screen-2xl mx-auto px-4 md:px-6 pb-16 md:pb-24">
        <div className="w-full flex flex-col items-end gap-y-12">
            <div className="text-right flex flex-col items-end gap-8">
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
