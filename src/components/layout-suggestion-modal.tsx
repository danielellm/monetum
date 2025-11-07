'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getLayoutSuggestions } from '@/app/actions';
import { Wand2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LayoutSuggestionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    setSuggestions(null);
    try {
      const result = await getLayoutSuggestions();
      setSuggestions(result.suggestedImprovements);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Layout-Vorschläge konnten nicht generiert werden.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary">
          Layout verbessern (AI)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline">
            <Wand2 className="text-primary" />
            Layout-Vorschläge generieren
          </DialogTitle>
          <DialogDescription>
            Lassen Sie die KI das aktuelle Layout analysieren und Verbesserungsvorschläge machen.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Analysiere Layout und generiere Vorschläge...</p>
            </div>
          )}
          {suggestions && (
            <div className="prose prose-sm prose-invert max-h-[50vh] overflow-y-auto rounded-md border border-border p-4">
              <div dangerouslySetInnerHTML={{ __html: suggestions.replace(/\n/g, '<br />') }} />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generiere...
              </>
            ) : (
              'Vorschläge generieren'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
