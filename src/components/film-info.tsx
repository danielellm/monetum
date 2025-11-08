'use client';

import { Film } from '@/lib/types';
import { motion } from 'framer-motion';
import React from 'react';
import TrailerEmbed from './trailer-embed';

const fadeInVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

function FadeInWhenVisible({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInVariant}
        >
            {children}
        </motion.div>
    );
}

export default function FilmInfo({ film }: { film: Film }) {
  return (
    <div className="bg-background py-16 md:py-24">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-16 items-start">
          
          {/* Left Column: Details */}
          <div className="flex flex-col gap-12">
            <FadeInWhenVisible>
                <div
                    className="prose prose-invert prose-p:text-gray-300 prose-headings:font-headline text-lg"
                    dangerouslySetInnerHTML={{ __html: film.description }}
                />
            </FadeInWhenVisible>
            
            <FadeInWhenVisible>
                <div className="text-sm font-mono space-y-2">
                  {film.cast.map((person) => (
                    <div key={person.name} className="flex items-center">
                        <span className="text-muted-foreground w-24 shrink-0">{person.role}</span>
                        <span className="text-muted-foreground mx-2">/</span>
                        <span className="text-foreground">{person.name}</span>
                    </div>
                  ))}
                </div>
            </FadeInWhenVisible>
          </div>

          {/* Right Column: Trailer */}
          <div className="mt-12 md:mt-0">
             <FadeInWhenVisible>
                {film.additional_trailer_url && (
                    <TrailerEmbed url={film.additional_trailer_url} />
                )}
            </FadeInWhenVisible>
          </div>

        </div>
      </div>
    </div>
  );
}
