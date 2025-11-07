import { Film } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="relative flex items-center justify-center">
        <Film className="h-16 w-16 animate-pulse text-primary" />
      </div>
    </div>
  );
}
