import { getSliderItems } from '@/lib/api';
import type { SliderItem } from '@/lib/types';
import FilmPageClient from '@/components/film-page-client';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Momentum Film',
  description: 'Erfahren Sie mehr über Momentum Film, unsere Vision und unser Team.',
};

export default async function AboutUsPage() {
  // Fetch all slider items (films + about us page)
  const sliderItems: SliderItem[] = await getSliderItems();
  
  const initialSlug = 'about-us';

  // Find the currently active item based on the slug to validate it exists
  const currentItemExists = sliderItems.some(f => f.slug === initialSlug);

  if (!currentItemExists) {
    // This case should ideally not be reached if mock data is correct
    notFound();
  }

  // Pass the list of all slider items and the initial slug to the client component
  return <FilmPageClient sliderItems={sliderItems} initialSlug={initialSlug} />;
}
