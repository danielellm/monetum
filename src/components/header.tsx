'use client';

import { useState } from 'react';
import { Film, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: '#contact', label: 'Contact' },
  ];

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
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className="hover:text-primary transition-colors">
                {link.label}
              </a>
            ))}
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
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center"
          >
            <button
              onClick={() => setIsMenuOpen(false)}
              aria-label="Menü schließen"
              className="absolute top-4 right-4 md:top-6 md:right-6 text-white"
            >
              <X className="h-8 w-8" />
            </button>

            <nav className="flex flex-col items-center gap-8">
                {navLinks.map((link, i) => (
                    <motion.a 
                        key={link.label} 
                        href={link.href}
                        custom={i}
                        variants={linkVariants}
                        initial="hidden"
                        animate="visible"
                        onClick={() => setIsMenuOpen(false)} 
                        className="text-3xl font-headline text-white hover:text-primary transition-colors">
                        {link.label}
                    </motion.a>
                ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
