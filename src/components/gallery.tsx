'use client';

import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';

import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

type GalleryProps = {
  images: string[];
};

export default function Gallery({ images }: GalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((src, index) => (
          <motion.div
            key={index}
            className="aspect-video relative overflow-hidden rounded-lg cursor-pointer group"
            onClick={() => setSelectedImage(src)}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={src}
              alt={`Galeriebild ${index + 1}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              data-ai-hint="cinematic shot"
            />
          </motion.div>
        ))}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={(isOpen) => !isOpen && setSelectedImage(null)}>
        <DialogContent className="max-w-5xl w-full p-2 bg-transparent border-0">
          {selectedImage && (
            <div className="relative aspect-video">
                <Image
                  src={selectedImage}
                  alt="Vollbild"
                  fill
                  className="object-contain"
                  sizes="100vw"
                  data-ai-hint="cinematic shot"
                />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
