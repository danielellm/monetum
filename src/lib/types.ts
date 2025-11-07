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
  additional_trailer_url: string;
  slider_position: number;
  is_startpage: boolean;
};
