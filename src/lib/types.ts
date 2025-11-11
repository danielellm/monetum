export type Film = {
  id: number;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  trailer_url: string;
  poster_url: string;
  gallery: string[];
  cast: { name: string; role: string }[];
  genre: string;
  duration: string;
  language: string;
  additional_trailer_url?: string; // Made optional
  slider_position: number;
  is_startpage: boolean;
};

export type AboutInfo = {
  id: 'about-us';
  title: string;
  slug: 'about-us';
  subtitle: string;
  description: string;
  trailer_url: string;
};

export type SliderItem = Film | AboutInfo;

// Type guard to check if an item is a Film
export function isFilm(item: SliderItem): item is Film {
  return (item as Film).slider_position !== undefined;
}
