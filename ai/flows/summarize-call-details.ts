// SummarizeCallDetails Flow
'use server';

/**
 * @fileOverview Summarizes key points and objections from a call log.
 *
 * - summarizeCallDetails - A function that summarizes call details.
 * - SummarizeCallDetailsInput - The input type for the summarizeCallDetails function.
 * - SummarizeCallDetailsOutput - The return type for the summarizeCallDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeCallDetailsInputSchema = z.object({
  callLog: z.string().describe('The complete call log text.'),
});
export type SummarizeCallDetailsInput = z.infer<typeof SummarizeCallDetailsInputSchema>;

const SummarizeCallDetailsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the key discussion points and objections raised during the call.'),
});
export type SummarizeCallDetailsOutput = z.infer<typeof SummarizeCallDetailsOutputSchema>;

export async function summarizeCallDetails(input: SummarizeCallDetailsInput): Promise<SummarizeCallDetailsOutput> {
  return summarizeCallDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeCallDetailsPrompt',
  input: {schema: SummarizeCallDetailsInputSchema},
  output: {schema: SummarizeCallDetailsOutputSchema},
  prompt: `You are an AI assistant helping sales managers understand call details quickly.
  Summarize the key discussion points and objections from the following call log:
  \n
  {{callLog}}
  \n
  Provide a concise summary that will help the sales manager understand the main points and provide targeted coaching to BDAs.`,
});

const summarizeCallDetailsFlow = ai.defineFlow(
  {
    name: 'summarizeCallDetailsFlow',
    inputSchema: SummarizeCallDetailsInputSchema,
    outputSchema: SummarizeCallDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
