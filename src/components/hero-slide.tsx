'use client';

import { Film } from '@/lib/types';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

type HeroSlideProps = {
  film: Film;
  isActive: boolean;
  isMuted: boolean;
  hasInteracted: boolean;
};

export default function HeroSlide({ film, isActive, isMuted, hasInteracted }: HeroSlideProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const playVideo = async () => {
    const video = videoRef.current;
    if (video) {
        try {
            if (video.paused) {
                await video.play();
            }
        } catch (error) {
            console.log("Video play was prevented by the browser. Awaiting user interaction.");
        }
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      if (hasInteracted || !('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
        playVideo();
      }
    } else {
      video.pause();
      if (video.currentTime !== 0) {
        video.currentTime = 0;
      }
    }
  }, [isActive, hasInteracted, film.trailer_url]);

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
        muted={isMuted}
        preload="auto"
        src={film.trailer_url}
        poster={film.poster_url}
      />
    </motion.div>
  );
}
