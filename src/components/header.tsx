'use client';

import { useState } from 'react';
import { Film, Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Film as FilmType } from '@/lib/types';
import Link from 'next/link';

type HeaderProps = {
  films: FilmType[];
};

export default function Header({ films }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuVariants = {
    hidden: { opacity: 0, y: '-100%' },
    visible: { opacity: 1, y: '0%', transition: { duration: 0.5, ease: 'easeInOut' } },
    exit: { opacity: 0, y: '-100%', transition: { duration: 0.5, ease: 'easeInOut' } },
  };

  const linkVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: (i: number) => ({
          opacity: 1,
          y: 0,
          transition: {
              delay: 0.3 + i * 0.1,
              duration: 0.5,
          },
      }),
  };

  return (
    <>
      <header className="absolute top-0 left-0 right-0 z-50 p-4 md:p-6 text-white bg-transparent">
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
          <a href="/" className="flex items-center gap-2 font-headline text-lg hover:text-primary transition-colors">
            <Film className="h-5 w-5" />
            <span>Momentum Film</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 hover:text-primary transition-colors outline-none">
                Movies <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {films.map((film) => (
                  <Link key={film.id} href={`/filme/${film.slug}`} passHref>
                    <DropdownMenuItem>
                      {film.title}
                    </DropdownMenuItem>
                  </Link>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/about-us" className="hover:text-primary transition-colors">
              about us
            </Link>
            <a href="#contact" className="hover:text-primary transition-colors">
              Contact
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(true)} aria-label="Menü öffnen">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center overflow-y-auto py-16"
          >
            <button
              onClick={() => setIsMenuOpen(false)}
              aria-label="Menü schließen"
              className="absolute top-4 right-4 md:top-6 md:right-6 text-white"
            >
              <X className="h-8 w-8" />
            </button>

            <nav className="flex flex-col items-center gap-8 text-center">
                 <motion.div
                    custom={0}
                    variants={linkVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-3xl font-headline text-white text-center"
                >
                    <p className="mb-4">Movies</p>
                    <div className="flex flex-col items-center gap-4">
                        {films.map((film) => (
                           <Link key={film.id} href={`/filme/${film.slug}`} onClick={() => setIsMenuOpen(false)} className="text-xl font-body text-gray-300 hover:text-primary transition-colors">
                               {film.title}
                           </Link>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    custom={1}
                    variants={linkVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <Link
                        href="/about-us"
                        onClick={() => setIsMenuOpen(false)}
                        className="text-3xl font-headline text-white hover:text-primary transition-colors">
                        about us
                    </Link>
                </motion.div>
                <motion.a
                    href="#contact"
                    custom={2}
                    variants={linkVariants}
                    initial="hidden"
                    animate="visible"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-3xl font-headline text-white hover:text-primary transition-colors">
                    Contact
                </motion.a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
