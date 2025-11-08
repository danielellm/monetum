'use client';

import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { useState } from 'react';

type GalleryProps = {
  images: string[];
};

export default function Gallery({ images }: GalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-1">
          {images.map((src, index) => (
            <CarouselItem key={index} className="basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 pl-1">
              <div
                className="aspect-video relative overflow-hidden cursor-pointer group"
                onClick={() => setSelectedImage(src)}
              >
                <Image
                  src={src}
                  alt={`Galeriebild ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  data-ai-hint="cinematic shot"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden md:block">
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white border-none hover:bg-black/70" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white border-none hover:bg-black/70" />
        </div>
      </Carousel>

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
