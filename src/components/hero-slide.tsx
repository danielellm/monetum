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
  
    const playVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        console.error("Video autoplay was prevented:", error);
        // On mobile, user interaction is often required.
        // The poster image will be shown as a fallback.
      }
    };
  
    if (isActive) {
      // Resetting src to ensure the video reloads and can be played again
      // This can help with some browser caching issues on navigation.
      video.load(); 
      playVideo();
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isActive, film.trailer_url]); // Rerun when film changes

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
        key={film.trailer_url} // key helps React to re-create the element when src changes
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
