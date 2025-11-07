import { Github, Twitter, Instagram } from 'lucide-react';
import LayoutSuggestionModal from './layout-suggestion-modal';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-secondary py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <p className="font-headline text-lg">Momentum Film</p>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Momentum Film. Alle Rechte vorbehalten.</p>
          <div className="mt-2">
            <LayoutSuggestionModal />
          </div>
        </div>
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
    </footer>
  );
}
