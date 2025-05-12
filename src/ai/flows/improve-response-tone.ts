// src/ai/flows/improve-response-tone.ts
'use server';

/**
 * @fileOverview Implements a Genkit flow to generate sales responses with a specified tone.
 *
 * - generateResponseWithTone - A function that generates a sales response with a specific tone.
 * - GenerateResponseWithToneInput - The input type for the generateResponseWithTone function.
 * - GenerateResponseWithToneOutput - The return type for the generateResponseWithTone function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateResponseWithToneInputSchema = z.object({
  leadComment: z.string().describe('The lead\'s comment or question.'),
  tone: z
    .enum(['Friendly', 'Assertive', 'Empathetic'])
    .describe('The desired tone for the AI-generated response.'),
  leadSegment: z
    .enum(['student', 'jobseeker', 'parent'])
    .optional()
    .describe('The segment of the lead.'),
});
export type GenerateResponseWithToneInput = z.infer<typeof GenerateResponseWithToneInputSchema>;

const GenerateResponseWithToneOutputSchema = z.object({
  response: z.string().describe('The AI-generated sales response.'),
});
export type GenerateResponseWithToneOutput = z.infer<typeof GenerateResponseWithToneOutputSchema>;

export async function generateResponseWithTone(input: GenerateResponseWithToneInput): Promise<GenerateResponseWithToneOutput> {
  return generateResponseWithToneFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateResponseWithTonePrompt',
  input: {schema: GenerateResponseWithToneInputSchema},
  output: {schema: GenerateResponseWithToneOutputSchema},
  prompt: `You are a sales expert, skilled in edtech and career programs. Generate a short, persuasive, and respectful response to the lead's comment, optimized for conversions.

Lead Comment: {{{leadComment}}}

Tone: {{{tone}}}

{% if leadSegment %}Lead Segment: {{{leadSegment}}}{% endif %}

Response:`,
});

const generateResponseWithToneFlow = ai.defineFlow(
  {
    name: 'generateResponseWithToneFlow',
    inputSchema: GenerateResponseWithToneInputSchema,
    outputSchema: GenerateResponseWithToneOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
