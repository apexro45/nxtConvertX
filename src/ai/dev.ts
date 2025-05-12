// src/ai/dev.ts
import { config as dotenvConfig } from 'dotenv';

// Attempt to load .env file and log the outcome
const dotenvResult = dotenvConfig();

if (dotenvResult.error) {
  console.error('🔴 [dev.ts] Error loading .env file. Please ensure it exists in the project root and is correctly formatted. Error:', dotenvResult.error.message);
} else {
  console.log('🟢 [dev.ts] .env file processed.');
  if (dotenvResult.parsed) {
    console.log('🔵 [dev.ts] Variables parsed from .env file:', Object.keys(dotenvResult.parsed).join(', '));
    if (!Object.keys(dotenvResult.parsed).includes('GEMINI_API_KEY') && !Object.keys(dotenvResult.parsed).includes('GOOGLE_API_KEY')) {
        console.warn('🟡 [dev.ts] WARNING: Neither GEMINI_API_KEY nor GOOGLE_API_KEY found in the parsed .env variables.');
    }
  } else {
    console.warn('🟡 [dev.ts] WARNING: .env file was processed, but no variables were parsed. Is the file empty or incorrectly formatted?');
  }
}

// Log critical environment variables just before flows are imported
console.log('🔵 [dev.ts] Value of GEMINI_API_KEY before importing flows:', process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET');
console.log('🔵 [dev.ts] Value of GOOGLE_API_KEY before importing flows:', process.env.GOOGLE_API_KEY ? 'SET' : 'NOT SET');
console.log('🔵 [dev.ts] Value of FINE_TUNED_MODEL_ID before importing flows:', process.env.FINE_TUNED_MODEL_ID ? process.env.FINE_TUNED_MODEL_ID : 'NOT SET');

console.log('🔵 [dev.ts] Importing AI flows...');
import '@/ai/flows/generate-sales-response.ts';
import '@/ai/flows/improve-response-tone.ts';
import '@/ai/flows/summarize-call-details.ts';
import '@/ai/flows/fine-tune-model.ts';
// The line "import '@/ai/training_data.jsonl';" was here and has been removed as it's incorrect.
// training_data.jsonl is loaded by the fine-tune-model.ts flow via fs.readFile.

console.log('🟢 [dev.ts] AI flows imported successfully.');
console.log('🔵 [dev.ts] Genkit development server should be starting/running flows now.');
