'use client';

import { Film } from '@/lib/types';
import Gallery from './gallery';
import TrailerEmbed from './trailer-embed';
import { motion } from 'framer-motion';
import React from 'react';

const fadeInVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

function FadeInWhenVisible({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInVariant}
        >
            {children}
        </motion.div>
    );
}

export default function FilmInfo({ film }: { film: Film }) {
  return (
    <div className="bg-background py-16 md:py-24 px-4 md:px-6">
      <div className="max-w-screen-2xl mx-auto">
        <div className="w-full">
            <FadeInWhenVisible>
                <div
                    className="prose prose-invert prose-p:text-gray-300 prose-headings:font-headline text-lg text-left"
                    dangerouslySetInnerHTML={{ __html: film.description }}
                />
            </FadeInWhenVisible>
            
            <FadeInWhenVisible>
                <div className="mt-12 text-sm text-right font-mono">
                  <p className="flex flex-wrap justify-end">
                    {film.cast.map((person, index) => (
                      <React.Fragment key={person.name}>
                        <span className="whitespace-nowrap">
                          <span className="text-muted-foreground">{person.role}:</span> <span className="text-foreground">{person.name}</span>
                        </span>
                        {index < film.cast.length - 1 && <span className="mx-2 text-muted-foreground">/</span>}
                      </React.Fragment>
                    ))}
                  </p>
                </div>
            </FadeInWhenVisible>
        </div>
      </div>

      {film.gallery && film.gallery.length > 0 && (
        <div className="max-w-6xl mx-auto mt-16 md:mt-24">
            <FadeInWhenVisible>
                <h3 className="text-3xl font-headline text-primary mb-8 text-center">Galerie</h3>
                <Gallery images={film.gallery} />
            </FadeInWhenVisible>
        </div>
      )}

      {film.additional_trailer_url && (
         <div className="max-w-4xl mx-auto mt-16 md:mt-24">
            <FadeInWhenVisible>
                <h3 className="text-3xl font-headline text-primary mb-8 text-center">Trailer</h3>
                <TrailerEmbed url={film.additional_trailer_url} />
            </FadeInWhenVisible>
         </div>
      )}
    </div>
  );
}