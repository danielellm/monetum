import { mockFilms } from './mock-data';
import type { Film } from './types';

// Simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function getFilms(): Promise<Film[]> {
  await delay(100); // Simulate API latency
  const sortedFilms = [...mockFilms].sort((a, b) => a.slider_position - b.slider_position);
  return sortedFilms;
}

export async function getFilmBySlug(slug: string): Promise<Film | undefined> {
  await delay(100); // Simulate API latency
  return mockFilms.find(film => film.slug === slug);
}
