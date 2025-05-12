// src/ai/flows/generate-sales-response.ts
// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview Generates a short, persuasive sales response based on lead input.
 *
 * - generateSalesResponse - A function that generates a sales response.
 * - GenerateSalesResponseInput - The input type for the generateSalesResponse function.
 * - GenerateSalesResponseOutput - The return type for the generateSalesResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSalesResponseInputSchema = z.object({
  leadInput: z.string().describe("The lead's question, concern, or objection."),
  leadSegment: z
    .enum(['student', 'jobseeker', 'parent'])
    .describe('The segment the lead belongs to.'),
  tone: z
    .enum(['Friendly', 'Assertive', 'Empathetic'])
    .describe('The desired tone of the response.'),
  name: z.string().optional().describe("The lead's name."),
  yog: z.string().optional().describe("The lead's year of graduation."),
  collegeName: z.string().optional().describe("The lead's college name."),
  leadState: z.string().optional().describe("The lead's state/location."),
  language: z.enum(["english", "hindi", "telugu", "tamil"]).default("english").describe("The lead's preferred language for the response."),
});

export type GenerateSalesResponseInput = z.infer<typeof GenerateSalesResponseInputSchema>;

const GenerateSalesResponseOutputSchema = z.object({
  salesResponses: z.array(z.string()).min(1).max(3).describe('List of 2-3 short, persuasive, and respectful sales responses. Each response should be distinct.'),
  usps: z.array(z.string().describe('A concise, 1-liner USP focusing on a key metric or benefit.')).min(1).max(3).describe('List of 2-3 concise, 1-liner Unique Selling Propositions (USPs) as points, focusing on key metrics and directly relevant to the lead\'s comment and the generated sales responses. Each USP should be a precise benefit statement supporting the replies.'),
});

export type GenerateSalesResponseOutput = z.infer<typeof GenerateSalesResponseOutputSchema>;

export async function generateSalesResponse(input: GenerateSalesResponseInput): Promise<GenerateSalesResponseOutput> {
  return generateSalesResponseFlow(input);
}

const generateSalesResponsePrompt = ai.definePrompt({
  name: 'generateSalesResponsePrompt',
  input: {schema: GenerateSalesResponseInputSchema},
  output: {schema: GenerateSalesResponseOutputSchema},
  prompt: `You are a sales expert specializing in edtech and career programs.

  A BDA is on a live sales call and needs your help. The lead has just said something (a question, objection, or concern).
  The BDA has provided the lead's statement, segment, desired tone, and other relevant details.

  Your task is to:
  1. Generate 2-3 distinct, short, correct, confident responses the BDA can say back on the call. Each response should be persuasive, respectful, and optimized for conversions.
  2. Provide 2-3 Unique Selling Propositions (USPs) as **concise, 1-liner points**. Each USP should focus on a **key metric or tangible benefit**, be directly relevant to the lead's input, and support/complement the generated sales responses. Include links to verifiable stats or tables if applicable (especially related to college placements if collegeName is provided).

  Lead Details:
  Name: {{#if name}}{{name}}{{else}}N/A{{/if}}
  Year of Graduation: {{#if yog}}{{yog}}{{else}}N/A{{/if}}
  College: {{#if collegeName}}{{collegeName}}{{else}}N/A{{/if}}
  State: {{#if leadState}}{{leadState}}{{else}}N/A{{/if}}
  Preferred Language for Response: {{language}} (If possible, tailor response to this language. Otherwise, use English.)

  Lead Segment: {{{leadSegment}}}
  Desired Tone: {{{tone}}}
  Lead Input: {{{leadInput}}}

  Output Format:
  Please provide the sales responses and USPs in the specified JSON format.
  Ensure the USPs logically follow from and reinforce the points made in the sales responses.
  If the lead's college name is provided, try to incorporate specific data points about placements or skill gaps relevant to that college or region, and how the program addresses them. Include links to verifiable stats or tables if possible.
  USPs MUST be 1-liner points, each highlighting a key metric or benefit.
  `,
});

const generateSalesResponseFlow = ai.defineFlow(
  {
    name: 'generateSalesResponseFlow',
    inputSchema: GenerateSalesResponseInputSchema,
    outputSchema: GenerateSalesResponseOutputSchema,
  },
  async input => {
    const {output} = await generateSalesResponsePrompt(input);
    return output!;
  }
);