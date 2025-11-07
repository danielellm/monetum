'use client';

import { Film } from '@/lib/types';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

type HeroSlideProps = {
  film: Film;
  isActive: boolean;
  isMuted: boolean;
};

export default function HeroSlide({ film, isActive, isMuted }: HeroSlideProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playVideo = () => {
      video.play().catch(error => {
        // Autoplay was prevented.
        console.error("Video play was prevented:", error);
      });
    };

    if (isActive) {
      // Check if video is already ready to play
      if (video.readyState >= 3) { // HAVE_FUTURE_DATA
        playVideo();
      } else {
        // If not, wait for it to be ready
        video.addEventListener('canplay', playVideo, { once: true });
      }
    } else {
      video.pause();
      video.currentTime = 0;
    }
    
    // Cleanup event listener
    return () => {
      video.removeEventListener('canplay', playVideo);
    }
  }, [isActive]);

  useEffect(() => {
     if(videoRef.current) {
        videoRef.current.muted = isMuted;
     }
  }, [isMuted]);

  return (
    <motion.div
      className="absolute inset-0 w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={{ duration: 1.5, ease: 'easeInOut' }}
    >
      <video
        ref={videoRef}
        key={film.trailer_url}
        className="w-full h-full object-cover"
        loop
        playsInline
        muted // Muted by default, controlled by parent state
        preload="auto"
        src={film.trailer_url}
        poster={film.poster_url}
      />
    </motion.div>
  );
}
