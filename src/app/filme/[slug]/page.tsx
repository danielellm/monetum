import { getFilms } from '@/lib/api';
import type { Film } from '@/lib/types';
import FilmPageClient from '@/components/film-page-client';
import { notFound } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next'
import { getFilmBySlug } from '@/lib/api';

type Props = {
  params: { slug: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Fetch the specific film for metadata
  const film = await getFilmBySlug(params.slug);

  if (!film) {
    return {
      title: 'Film nicht gefunden | Momentum Film'
    }
  }

  // Generate metadata based on the film's details
  return {
    title: `${film.title} | Momentum Film`,
    description: film.description.replace(/<[^>]*>?/gm, '').substring(0, 160),
    openGraph: {
      title: film.title,
      description: film.description.replace(/<[^>]*>?/gm, '').substring(0, 160),
      images: [
        {
          url: film.poster_url,
          width: 1000,
          height: 1500,
          alt: `Poster for ${film.title}`,
        },
      ],
    },
  }
}

export async function generateStaticParams() {
  const films = await getFilms();
  // Map films to the required format for static paths
  return films.map((film) => ({
    slug: film.slug,
  }));
}

export default async function FilmPage({ params }: Props) {
  // Fetch all films. The sorting will now be handled inside the client component.
  const films: Film[] = await getFilms();
  
  // Find the currently active film based on the slug to validate it exists
  const currentFilmExists = films.some(f => f.slug === params.slug);

  if (!currentFilmExists) {
    // If the film is not found, show a 404 page
    notFound();
  }

  // Pass the unsorted list of films and the initial slug to the client component
  // The client component is now responsible for sorting
  return <FilmPageClient films={films} initialSlug={params.slug} />;
}
