'use client';

import { Film } from '@/lib/types';
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
    <div className="bg-background py-16 md:py-24">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6">
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
    </div>
  );
}
