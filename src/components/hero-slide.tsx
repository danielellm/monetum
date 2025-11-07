'use client';

import { Film } from '@/lib/types';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

type HeroSlideProps = {
  film: Film;
  isActive: boolean;
  isMuted: boolean;
  hasInteracted: boolean; // Keep this to know if the user has engaged
};

export default function HeroSlide({ film, isActive, isMuted, hasInteracted }: HeroSlideProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Define a reusable play function that handles errors
  const playVideo = async () => {
    const video = videoRef.current;
    if (video) {
        try {
            if (video.paused) {
                await video.play();
            }
        } catch (error) {
            // This error is expected on mobile before user interaction
            console.log("Video play was prevented by the browser. Awaiting user interaction.");
        }
    }
  };

  // Expose the play function for the parent component to call it
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    (video as any).customPlay = playVideo;
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
  
    // On desktop (and after interaction on mobile), play the video if it's active
    if (isActive) {
      playVideo();
    } else {
      video.pause();
      if (video.currentTime !== 0) {
        video.currentTime = 0;
      }
    }
  }, [isActive, hasInteracted, film.trailer_url]); // Re-run when active status or interaction status changes

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
        muted // Always start muted, parent controls via isMuted prop
        preload="auto"
        src={film.trailer_url}
        poster={film.poster_url}
      />
    </motion.div>
  );
}
