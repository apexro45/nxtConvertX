import { config } from 'dotenv';
config();

import '@/ai/flows/generate-sales-response.ts';
import '@/ai/flows/improve-response-tone.ts';
import '@/ai/flows/summarize-call-details.ts';
import '@/ai/flows/fine-tune-model.ts';
