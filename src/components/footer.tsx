'use client';

import LayoutSuggestionModal from './layout-suggestion-modal';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-secondary py-16 px-4 md:px-8">
      <div className="max-w-screen-2xl mx-auto flex flex-wrap justify-between items-center gap-12">
        
        {/* Left: Copyright & AI Link */}
        <div className="text-left">
          <p className="font-headline text-lg">Momentum Film</p>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Momentum Film. Alle Rechte vorbehalten.</p>
          <div className="mt-2">
            <LayoutSuggestionModal />
          </div>
        </div>

      </div>
    </footer>
  );
}
