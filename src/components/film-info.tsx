'use client';

import { Film } from '@/lib/types';
import React from 'react';
import TrailerEmbed from './trailer-embed';
import { cn } from '@/lib/utils';

export default function FilmInfo({ film }: { film: Film }) {
  const hasAdditionalTrailer = !!film.additional_trailer_url;

  return (
    <div className="bg-background py-16 md:py-24">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6">
        <div
          className={cn(
            'grid grid-cols-1 items-start',
            hasAdditionalTrailer && 'md:grid-cols-2 md:gap-16'
          )}
        >
          {/* Left Column: Details */}
          <div
            className={cn(
              'flex flex-col justify-between h-full min-h-[300px]',
              !hasAdditionalTrailer && 'col-span-1'
            )}
          >
            <div>
              <div
                className={cn(
                  'prose prose-invert prose-p:text-gray-300 prose-headings:font-headline text-lg',
                  !hasAdditionalTrailer && 'max-w-4xl'
                )}
                dangerouslySetInnerHTML={{ __html: film.description }}
              />
            </div>

            <div className="mt-12 md:mt-0">
              <div className="text-sm font-mono text-right flex flex-wrap justify-end">
                {film.cast.map((person, index) => (
                  <React.Fragment key={person.name}>
                    <span className="inline-flex">
                      <span className="text-muted-foreground shrink-0">{person.role}</span>
                      <span className="text-muted-foreground mx-2">/</span>
                      <span className="text-foreground whitespace-nowrap">{person.name}</span>
                    </span>
                    {index < film.cast.length - 1 && (
                      <span className="text-muted-foreground mx-2">/</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Trailer (Conditional) */}
          {hasAdditionalTrailer && (
            <div className="mt-12 md:mt-0">
              <TrailerEmbed url={film.additional_trailer_url} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
