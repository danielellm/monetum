import { getFilmBySlug, getFilms } from '@/lib/api';
import type { Film } from '@/lib/types';
import FilmPageClient from '@/components/film-page-client';
import { notFound } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next'

type Props = {
  params: { slug: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const film = await getFilmBySlug(params.slug);

  if (!film) {
    return {
      title: 'Film nicht gefunden | Momentum Film'
    }
  }

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
  return films.map((film) => ({
    slug: film.slug,
  }));
}

export default async function FilmPage({ params }: Props) {
  const films: Film[] = await getFilms();
  const sortedFilms = [...films].sort((a, b) => a.slider_position - b.slider_position);
  const currentFilm = sortedFilms.find(f => f.slug === params.slug);

  if (!currentFilm) {
    notFound();
  }

  return <FilmPageClient films={sortedFilms} initialSlug={params.slug} />;
}
