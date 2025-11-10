import { getSliderItems, getItemBySlug } from '@/lib/api';
import type { SliderItem } from '@/lib/types';
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
  // Fetch the specific item for metadata
  const item = await getItemBySlug(params.slug);

  if (!item) {
    return {
      title: 'Seite nicht gefunden | Momentum Film'
    }
  }

  const description = item.description.replace(/<[^>]*>?/gm, '').substring(0, 160);
  
  // Use poster_url if it's a film
  const imageUrl = 'poster_url' in item ? item.poster_url : undefined;

  return {
    title: `${item.title} | Momentum Film`,
    description: description,
    openGraph: {
      title: item.title,
      description: description,
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 1000,
          height: 1500,
          alt: `Poster for ${item.title}`,
        },
      ] : [],
    },
  }
}

export async function generateStaticParams() {
  const items = await getSliderItems();
  // Map all slider items to the required format for static paths
  return items.map((item) => ({
    slug: item.slug,
  }));
}

export default async function FilmPage({ params }: Props) {
  // Fetch all slider items (films + about us page)
  const sliderItems: SliderItem[] = await getSliderItems();
  
  // Find the currently active item based on the slug to validate it exists
  const currentItemExists = sliderItems.some(f => f.slug === params.slug);

  if (!currentItemExists) {
    // If the item is not found, show a 404 page
    notFound();
  }

  // Pass the list of all slider items and the initial slug to the client component
  return <FilmPageClient sliderItems={sliderItems} initialSlug={params.slug} />;
}
