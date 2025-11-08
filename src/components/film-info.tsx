'use client';

import { Film } from '@/lib/types';
import { motion } from 'framer-motion';
import React from 'react';
import TrailerEmbed from './trailer-embed';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      ease: [0.6, 0.01, 0.05, 0.95], // Corrected value
      duration: 0.8,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ease: [0.6, 0.01, 0.05, 0.95], // Corrected value
      duration: 0.8,
    },
  },
};


export default function FilmInfo({ film }: { film: Film }) {
  return (
    <motion.div 
        className="bg-background py-16 md:py-24"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
    >
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-16 items-start">
          
          {/* Left Column: Details */}
          <div className="flex flex-col justify-between h-full min-h-[300px]">
            <motion.div variants={itemVariants}>
                <div
                    className="prose prose-invert prose-p:text-gray-300 prose-headings:font-headline text-lg"
                    dangerouslySetInnerHTML={{ __html: film.description }}
                />
            </motion.div>
            
            <motion.div variants={itemVariants} className="mt-12 md:mt-0">
                <div className="text-sm font-mono text-right flex flex-wrap justify-end">
                  {film.cast.map((person, index) => (
                    <React.Fragment key={person.name}>
                      <span className="inline-flex">
                          <span className="text-muted-foreground shrink-0">{person.role}</span>
                          <span className="text-muted-foreground mx-2">/</span>
                          <span className="text-foreground whitespace-nowrap">{person.name}</span>
                      </span>
                      {index < film.cast.length - 1 && <span className="text-muted-foreground mx-2">/</span>}
                    </React.Fragment>
                  ))}
                </div>
            </motion.div>
          </div>

          {/* Right Column: Trailer */}
          <motion.div variants={itemVariants} className="mt-12 md:mt-0">
            {film.additional_trailer_url && (
                <TrailerEmbed url={film.additional_trailer_url} />
            )}
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}
