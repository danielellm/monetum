'use client';

import { Film } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import Gallery from './gallery';
import TrailerEmbed from './trailer-embed';
import { motion } from 'framer-motion';

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
    <div className="bg-background py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Left Column: Description */}
        <div className="md:col-span-2">
            <FadeInWhenVisible>
                <div
                    className="prose prose-invert prose-p:text-gray-300 prose-headings:font-headline text-lg"
                    dangerouslySetInnerHTML={{ __html: film.description }}
                />
            </FadeInWhenVisible>
        </div>

        {/* Right Column: Meta */}
        <div className="space-y-8">
            <FadeInWhenVisible>
                <Card className="bg-transparent border-secondary">
                    <CardHeader>
                        <CardTitle className="font-headline text-primary">Details</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2 font-mono">
                        <p><strong>Genre:</strong> {film.genre}</p>
                        <p><strong>Dauer:</strong> {film.duration}</p>
                        <p><strong>Sprache:</strong> {film.language}</p>
                    </CardContent>
                </Card>
            </FadeInWhenVisible>
            <FadeInWhenVisible>
                <Card className="bg-transparent border-secondary">
                    <CardHeader>
                        <CardTitle className="font-headline text-primary">Cast & Crew</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2 font-mono">
                        {film.cast.map((person) => (
                            <p key={person.name}><strong>{person.role}:</strong> {person.name}</p>
                        ))}
                    </CardContent>
                </Card>
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
