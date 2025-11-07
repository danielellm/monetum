import { mockFilms } from './mock-data';
import type { Film } from './types';

// Simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function getFilms(): Promise<Film[]> {
  await delay(100); // Simulate API latency
  // Return the films without sorting them here, as sorting is handled by the component
  return [...mockFilms];
}

export async function getFilmBySlug(slug: string): Promise<Film | undefined> {
  await delay(100); // Simulate API latency
  // Find a specific film by its slug
  return mockFilms.find(film => film.slug === slug);
}
