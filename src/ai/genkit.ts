import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  // To use your fine-tuned model, set the FINE_TUNED_MODEL_ID environment variable
  // to its full name (e.g., tunedModels/your-tuned-model-id)
  // The fine-tuning flow (fine-tune-model.ts) will output this name.
  model: process.env.FINE_TUNED_MODEL_ID || 'googleai/gemini-2.0-flash', 
});
