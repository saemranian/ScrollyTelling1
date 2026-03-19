'use server';
/**
 * @fileOverview An AI agent for generating descriptive text for story segments.
 *
 * - generateStorySegmentDescription - A function that handles the story segment description generation process.
 * - GenerateStorySegmentDescriptionInput - The input type for the generateStorySegmentDescription function.
 * - GenerateStorySegmentDescriptionOutput - The return type for the generateStorySegmentDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStorySegmentDescriptionInputSchema = z.object({
  promptOrKeyDetails: z.string().describe('A short prompt or key details to generate a story segment description from.'),
});
export type GenerateStorySegmentDescriptionInput = z.infer<typeof GenerateStorySegmentDescriptionInputSchema>;

const GenerateStorySegmentDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated descriptive text for the story segment.'),
});
export type GenerateStorySegmentDescriptionOutput = z.infer<typeof GenerateStorySegmentDescriptionOutputSchema>;

const generateDescriptionPrompt = ai.definePrompt({
  name: 'generateStorySegmentDescriptionPrompt',
  input: {schema: GenerateStorySegmentDescriptionInputSchema},
  output: {schema: GenerateStorySegmentDescriptionOutputSchema},
  prompt: `You are an AI assistant specialized in creative writing and storytelling. Your task is to generate compelling and fitting descriptive text for a story segment.

Based on the following prompt or key details, create a vivid and engaging description:

Prompt or Key Details: {{{promptOrKeyDetails}}}

Please ensure the output is suitable for an interactive narrative experience, focusing on sensory details and mood.
The response should be a JSON object with a single field named "description".`,
});

const generateStorySegmentDescriptionFlow = ai.defineFlow(
  {
    name: 'generateStorySegmentDescriptionFlow',
    inputSchema: GenerateStorySegmentDescriptionInputSchema,
    outputSchema: GenerateStorySegmentDescriptionOutputSchema,
  },
  async (input) => {
    const {output} = await generateDescriptionPrompt(input);
    if (!output) {
      throw new Error('Failed to generate story segment description.');
    }
    return output;
  }
);

export async function generateStorySegmentDescription(input: GenerateStorySegmentDescriptionInput): Promise<GenerateStorySegmentDescriptionOutput> {
  return generateStorySegmentDescriptionFlow(input);
}
