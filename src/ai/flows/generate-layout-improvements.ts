'use server';

/**
 * @fileOverview A layout improvement suggestion AI agent.
 *
 * - generateLayoutImprovements - A function that handles the layout improvements generation process.
 * - GenerateLayoutImprovementsInput - The input type for the generateLayoutImprovements function.
 * - GenerateLayoutImprovementsOutput - The return type for the generateLayoutImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLayoutImprovementsInputSchema = z.object({
  currentLayoutDescription: z
    .string()
    .describe('The description of the current layout of the Momentum Film website.'),
  filmDataStructure: z
    .string()
    .describe('The data structure of the film data fetched from the Redaxo API.'),
  uiStyleGuide: z
    .string()
    .describe('The UI style guide of the Momentum Film website, including colors, fonts, and general aesthetic.'),
});
export type GenerateLayoutImprovementsInput = z.infer<
  typeof GenerateLayoutImprovementsInputSchema
>;

const GenerateLayoutImprovementsOutputSchema = z.object({
  suggestedImprovements: z
    .string()
    .describe('The suggested layout improvements for the Momentum Film website.'),
});
export type GenerateLayoutImprovementsOutput = z.infer<
  typeof GenerateLayoutImprovementsOutputSchema
>;

export async function generateLayoutImprovements(
  input: GenerateLayoutImprovementsInput
): Promise<GenerateLayoutImprovementsOutput> {
  return generateLayoutImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLayoutImprovementsPrompt',
  input: {schema: GenerateLayoutImprovementsInputSchema},
  output: {schema: GenerateLayoutImprovementsOutputSchema},
  prompt: `You are an expert UI/UX designer specializing in film website layouts.

You will analyze the current layout description, film data structure, and UI style guide to suggest layout improvements for the Momentum Film website.

Current Layout Description: {{{currentLayoutDescription}}}
Film Data Structure: {{{filmDataStructure}}}
UI Style Guide: {{{uiStyleGuide}}}

Based on this information, provide a list of actionable layout improvements that enhance content presentation and user experience.
`,
});

const generateLayoutImprovementsFlow = ai.defineFlow(
  {
    name: 'generateLayoutImprovementsFlow',
    inputSchema: GenerateLayoutImprovementsInputSchema,
    outputSchema: GenerateLayoutImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
