// src/ai/flows/fine-tune-model.ts
'use server';
/**
 * @fileOverview A Genkit flow to fine-tune a model for Conversion Copilot.
 *
 * - fineTuneConversionModel - A function that initiates the model fine-tuning process.
 * - FineTuneConversionModelInput - The input type for the fineTuneConversionModel function.
 * - FineTuneConversionModelOutput - The return type for the fineTuneConversionModel function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';
import * as fs from 'node:fs/promises';

// Schema for each individual training example in your JSONL file
const TrainingDataSchema = z.object({
  input: z.string().describe("The user's query or statement."),
  output: z.string().describe('The desired model response.'),
});

// Input schema for the fine-tuning flow
const FineTuneConversionModelInputSchema = z.object({
  trainingDataFile: z
    .string()
    .describe('Path to the JSONL training data file.'),
  tunedModelId: z
    .string()
    .default('conversion-copilot-tuned')
    .describe(
      'The desired ID for the fine-tuned model (e.g., my-tuned-model-v1). This will be used to refer to the model later.'
    ),
  baseModel: z
    .string()
    .default('gemini-1.0-pro-001') // A common tunable model, verify latest from Google
    .describe('The base model to fine-tune (e.g., gemini-1.0-pro-001).'),
  displayName: z
    .string()
    .optional()
    .describe(
      'A user-friendly display name for the tuned model in Google Cloud.'
    ),
  description: z
    .string()
    .optional()
    .describe('A description for the tuned model.'),
});
export type FineTuneConversionModelInput = z.infer<
  typeof FineTuneConversionModelInputSchema
>;

// Output schema for the fine-tuning flow
const FineTuneConversionModelOutputSchema = z.object({
  modelName: z
    .string()
    .describe(
      'The full name of the fine-tuned model (e.g., tunedModels/conversion-copilot-tuned).'
    ),
  status: z
    .string()
    .describe(
      'The status of the fine-tuning job (e.g., "Job submitted", "Completed", "Failed").'
    ),
  jobId: z.string().optional().describe('The ID of the tuning job, if applicable.')
});
export type FineTuneConversionModelOutput = z.infer<
  typeof FineTuneConversionModelOutputSchema
>;

export const fineTuneConversionModel = ai.defineFlow(
  {
    name: 'fineTuneConversionModelFlow',
    inputSchema: FineTuneConversionModelInputSchema,
    outputSchema: FineTuneConversionModelOutputSchema,
    directInvoke: true, // Allows running this flow via 'genkit direct-invoke'
  },
  async (inputParams) => {
    const fileContent = await fs.readFile(inputParams.trainingDataFile, 'utf-8');
    const lines = fileContent.trim().split('\n');
    const trainingExamples: { textInput: string; outputText: string }[] = [];

    for (const line of lines) {
      if (line.trim() === '') continue;
      try {
        const jsonData = JSON.parse(line);
        const parsedData = TrainingDataSchema.parse(jsonData);
        // Google AI fine-tuning expects 'textInput' and 'outputText'
        trainingExamples.push({
          textInput: parsedData.input,
          outputText: parsedData.output,
        });
      } catch (error) {
        console.error(`Error parsing JSON line: "${line}"`, error);
        throw new Error(
          `Failed to parse training data: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }

    if (trainingExamples.length === 0) {
      throw new Error('No valid training data found in the provided file.');
    }

    try {
      console.log(
        `Starting fine-tuning for model ID: ${inputParams.tunedModelId} based on ${inputParams.baseModel} with ${trainingExamples.length} examples.`
      );
      
      const googleAiPlugin = ai.getPlugin(googleAI().name);
      if (!googleAiPlugin || !googleAiPlugin.createTunedModel) {
        throw new Error('Google AI plugin with createTunedModel capability not found or not configured correctly.');
      }

      // The createTunedModel method typically starts an operation.
      // The operation object might contain details about the job.
      const operation = await googleAiPlugin.createTunedModel({
        sourceModel: inputParams.baseModel, // The base model to fine-tune
        id: inputParams.tunedModelId, // The custom ID for your tuned model
        trainingData: {
          examples: {
            examples: trainingExamples,
          },
        },
        displayName: inputParams.displayName ?? `Tuned ${inputParams.tunedModelId}`,
        description: inputParams.description ?? `Fine-tuned model for Conversion Copilot: ${inputParams.tunedModelId}`,
        // You might need to configure epochs, learning rate, etc., depending on the API
      });

      // The operation object structure depends on the Genkit Google AI plugin version.
      // It might directly return model info or an operation ID to poll.
      // For this example, we assume it gives us enough to report back.
      // In a real scenario, you might need to poll the operation status.
      
      const modelName = operation.name || `tunedModels/${inputParams.tunedModelId}`; // Construct if not directly available
      const statusMessage = operation.done ? 'Completed' : 'Job submitted, check Google Cloud Console for status.';
      const jobId = (operation as any).name || undefined; // Often the operation name is the job ID

      console.log(`Fine-tuning job submitted. Model Name (or Operation Name): ${modelName}, Status: ${statusMessage}`);
      
      return {
        modelName: modelName,
        status: statusMessage,
        jobId: jobId,
      };

    } catch (error) {
      console.error('Error during fine-tuning process:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      // Attempt to extract more specific error details if available
      const detailedError = (error as any)?.details || (error as any)?.error?.message || errorMessage;
      throw new Error(`Fine-tuning failed: ${detailedError}`);
    }
  }
);
