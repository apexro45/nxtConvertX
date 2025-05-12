import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
  console.warn('WARNING: Neither GEMINI_API_KEY nor GOOGLE_API_KEY environment variable is set. Please set one to use the Google AI plugin.');
}

export const ai = genkit({
  plugins: [googleAI()],
  // To use your fine-tuned model, set the FINE_TUNED_MODEL_ID environment variable
  // to its full name (e.g., tunedModels/your-tuned-model-id)
  // The fine-tuning flow (fine-tune-model.ts) will output this name.
  model: process.env.FINE_TUNED_MODEL_ID || 'googleai/gemini-2.0-flash', 
});

