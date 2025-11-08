'use client';

import ImpressumDialog from './impressum-dialog';

export default function Footer() {
  return (
    <footer className="bg-black py-8 px-4 md:px-8">
      <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        
        {/* Left: Copyright */}
        <div className="text-center sm:text-left">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Momentum Film. Alle Rechte vorbehalten.</p>
        </div>

        {/* Right: Impressum Link */}
        <div className="text-center sm:text-right">
            <ImpressumDialog />
        </div>

      </div>
    </footer>
  );
}
