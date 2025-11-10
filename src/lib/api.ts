import { mockFilms, mockAboutInfo } from './mock-data';
import type { Film, SliderItem, AboutInfo } from './types';

// Simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// This function now returns all items for the slider, including films and the about page
export async function getSliderItems(): Promise<SliderItem[]> {
  await delay(100); // Simulate API latency
  
  // Sort films by slider_position
  const sortedFilms = [...mockFilms].sort((a, b) => a.slider_position - b.slider_position);
  
  // Append the about info at the end
  return [...sortedFilms, mockAboutInfo];
}

export async function getFilms(): Promise<Film[]> {
  await delay(100);
  return [...mockFilms];
}

export async function getItemBySlug(slug: string): Promise<SliderItem | undefined> {
  await delay(100);
  const items = [...mockFilms, mockAboutInfo];
  return items.find(item => item.slug === slug);
}
