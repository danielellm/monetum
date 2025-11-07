import { redirect } from 'next/navigation';
import { getFilms } from '@/lib/api';
import { Film } from '@/lib/types';

export default async function HomePage() {
  const films: Film[] = await getFilms();
  
  if (!films || films.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <h1 className="text-2xl font-headline">Keine Filme gefunden.</h1>
      </div>
    );
  }

  const startFilm = films.find(film => film.is_startpage) 
                    || films.sort((a, b) => a.slider_position - b.slider_position)[0];

  if (startFilm) {
    redirect(`/filme/${startFilm.slug}`);
  }

  // This should not be reached if films exist
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
      <h1 className="text-2xl font-headline">Startfilm konnte nicht geladen werden.</h1>
    </div>
  );
}
