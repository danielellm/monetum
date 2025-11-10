'use client';

import { SliderItem } from '@/lib/types';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

type HeroSlideProps = {
  item: SliderItem;
  isActive: boolean;
  isMuted: boolean;
  hasInteracted: boolean;
};

export default function HeroSlide({ item, isActive, isMuted, hasInteracted }: HeroSlideProps) {
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
  }, [isActive, hasInteracted, item.trailer_url]);

  useEffect(() => {
     if(videoRef.current) {
        videoRef.current.muted = isMuted;
     }
  }, [isMuted]);
  
  const posterUrl = 'poster_url' in item ? item.poster_url : undefined;

  return (
    <motion.div
      className="absolute inset-0 w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={{ duration: 1.5, ease: 'easeInOut' }}
    >
      <video
        ref={videoRef}
        key={item.trailer_url}
        className="w-full h-full object-cover"
        loop
        playsInline
        muted={isMuted}
        preload="auto"
        src={item.trailer_url}
        poster={posterUrl}
      />
    </motion.div>
  );
}
