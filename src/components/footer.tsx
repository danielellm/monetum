'use client';

import { Github, Twitter, Instagram } from 'lucide-react';
import LayoutSuggestionModal from './layout-suggestion-modal';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-secondary py-16 px-4 md:px-8">
      <div className="max-w-screen-2xl mx-auto flex flex-wrap justify-between items-start gap-12">
        
        {/* Left: Copyright & AI Link */}
        <div className="text-left">
          <p className="font-headline text-lg">Momentum Film</p>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Momentum Film. Alle Rechte vorbehalten.</p>
          <div className="mt-2">
            <LayoutSuggestionModal />
          </div>
        </div>

        {/* Center: Social Links */}
        <div className="flex-grow flex items-start justify-start md:justify-center">
            <div className="flex items-center gap-4">
              <a href="#" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram />
              </a>
              <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter />
              </a>
              <a href="#" aria-label="Github" className="text-muted-foreground hover:text-primary transition-colors">
                <Github />
              </a>
            </div>
        </div>

        {/* Right: Contact Info */}
        <div className="text-left md:text-right flex flex-col sm:flex-row sm:gap-12">
            <div className="mb-6 sm:mb-0">
                <h3 className="text-sm text-muted-foreground">say hello</h3>
                <a href="mailto:email@email.de" className="text-white hover:text-primary transition-colors">email_at_email.de</a>
            </div>
            <div>
                <h3 className="text-sm text-muted-foreground">location</h3>
                <div className="text-white not-italic">
                    <p>MOMENTUM FILM</p>
                    <p>Lindenstr. 114</p>
                    <p>10969 Berlin</p>
                </div>
            </div>
        </div>

      </div>
    </footer>
  );
}