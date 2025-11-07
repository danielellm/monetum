'use server';

import { generateLayoutImprovements } from '@/ai/flows/generate-layout-improvements';
import type { GenerateLayoutImprovementsOutput } from '@/ai/flows/generate-layout-improvements';

export async function getLayoutSuggestions(): Promise<GenerateLayoutImprovementsOutput> {
  const input = {
    currentLayoutDescription: `The website is a minimalist, full-screen film portfolio for 'Momentum Film'. The main page features a full-screen video carousel. Each slide represents a film with an autoplaying background video trailer. An overlay shows the film's title, subtitle, and a progress bar for the autoplay timer. Navigation is possible via arrows, keyboard, and swipe. Below the hero carousel, a content area displays details of the active film, including a text description, a photo gallery with a lightbox, cast/crew list, and an embed for an additional trailer. The design is dark-themed (black background, white text) with a yellow accent color.`,
    filmDataStructure: `{
      "id": "number",
      "title": "string",
      "slug": "string",
      "subtitle": "string",
      "description": "HTML string",
      "trailer_url": "URL to a video file",
      "poster_url": "URL to an image file",
      "gallery": "array of image URLs",
      "cast": "array of { name: string, role: string }",
      "genre": "string",
      "duration": "string",
      "language": "string",
      "additional_trailer_url": "URL to Vimeo/YouTube",
      "slider_position": "number",
      "is_startpage": "boolean"
    }`,
    uiStyleGuide: `The UI is minimalist, cinematic, and dark-themed. Background: Black (#000000). Text: White (#FFFFFF). Accent: Bright Yellow (#FFD400). Fonts: 'Inter' for body, 'Space Grotesk' for headlines. The layout uses lots of negative space. Animations should be smooth and subtle (fades).`,
  };

  try {
    const result = await generateLayoutImprovements(input);
    return result;
  } catch (error) {
    console.error('Error generating layout improvements:', error);
    throw new Error('Failed to get suggestions from AI.');
  }
}
