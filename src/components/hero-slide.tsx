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

    if (isActive) {
      video.play().catch(error => console.error("Video play failed:", error));
    } else {
      video.pause();
      video.currentTime = 0;
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
      />
      <div className="absolute inset-0 bg-black/30" />
    </motion.div>
  );
}
