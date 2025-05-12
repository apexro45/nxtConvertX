// src/app/actions.ts
"use server";

import { generateSalesResponse, type GenerateSalesResponseInput as GenSalesInputType, type GenerateSalesResponseOutput } from "@/ai/flows/generate-sales-response";
import { z } from "zod";
import { indianStates } from "@/lib/indian-states"; // Corrected import path

// Exporting the type for client-side usage
export type GenerateSalesResponseInput = GenSalesInputType;

const stateValues = indianStates.map(state => state.name) as [string, ...string[]];


const generateResponseInputSchema = z.object({
  leadInput: z.string().min(3, "Lead input must be at least 3 characters."),
  leadSegment: z.enum(["student", "jobseeker", "parent"]),
  tone: z.enum(["Friendly", "Assertive", "Empathetic"]),
  name: z.string().min(2, "Name must be at least 2 characters.").optional().or(z.literal('')),
  yog: z.string().optional(),
  collegeName: z.string().optional(),
  leadState: z.enum(stateValues, { errorMap: () => ({ message: "Please select a valid state." }) }).optional().or(z.literal('')),
  language: z.enum(["english", "hindi", "telugu", "tamil"]).default("english"),
});

// Schema for logging a call
const CallInteractionSchema = z.object({
  leadInput: z.string(),
  salesResponses: z.array(z.string()),
  usps: z.array(z.string()),
});
export type CallInteraction = z.infer<typeof CallInteractionSchema>;

const LogCallInputSchema = z.object({
  leadDetails: z.object({
    name: z.string().optional(),
    yog: z.string().optional(),
    collegeName: z.string().optional(),
    leadState: z.string().optional(),
    language: z.enum(["english", "hindi", "telugu", "tamil"]).default("english"),
    leadSegment: z.enum(["student", "jobseeker", "parent"]),
    tone: z.enum(["Friendly", "Assertive", "Empathetic"]),
  }),
  interactions: z.array(CallInteractionSchema),
  notes: z.string().optional(),
});
export type LogCallInput = z.infer<typeof LogCallInputSchema>;


export interface FormState {
  message: string | null;
  fields?: {
    leadInput?: string; 
    leadSegment?: "student" | "jobseeker" | "parent";
    tone?: "Friendly" | "Assertive" | "Empathetic";
    name?: string;
    yog?: string;
    collegeName?: string;
    leadState?: string;
    language?: "english" | "hindi" | "telugu" | "tamil";
  };
  issues?: string[];
  salesResponseOutput?: GenerateSalesResponseOutput | null;
}

export async function handleGenerateResponseAction(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const leadInput = formData.get("leadInput") as string;
  const leadSegment = formData.get("leadSegment") as "student" | "jobseeker" | "parent";
  const tone = formData.get("tone") as "Friendly" | "Assertive" | "Empathetic";
  const name = formData.get("name") as string || undefined;
  const yog = formData.get("yog") as string || undefined;
  const collegeName = formData.get("collegeName") as string || undefined;
  const leadState = formData.get("leadState") as string || undefined;
  const language = formData.get("language") as "english" | "hindi" | "telugu" | "tamil" || "english";

  const validatedFields = generateResponseInputSchema.safeParse({
    leadInput,
    leadSegment,
    tone,
    name,
    yog,
    collegeName,
    leadState,
    language,
  });

  if (!validatedFields.success) {
    const issues = validatedFields.error.issues.map((issue) => issue.message);
    return {
      message: "Validation failed. Please check your inputs.",
      issues,
      fields: {
        leadInput, 
        leadSegment,
        tone,
        name: name || "",
        yog: yog || "",
        collegeName: collegeName || "",
        leadState: leadState || "",
        language,
      },
      salesResponseOutput: null,
    };
  }

  try {
    const aiInput: GenerateSalesResponseInput = {
      leadInput: validatedFields.data.leadInput,
      leadSegment: validatedFields.data.leadSegment,
      tone: validatedFields.data.tone,
      name: validatedFields.data.name,
      yog: validatedFields.data.yog,
      collegeName: validatedFields.data.collegeName,
      leadState: validatedFields.data.leadState,
      language: validatedFields.data.language,
    };
    
    const result = await generateSalesResponse(aiInput);

    if (result && result.salesResponses && result.usps) {
      return {
        message: "Response generated successfully.",
        salesResponseOutput: result,
        fields: { 
          leadInput: validatedFields.data.leadInput,
          name: validatedFields.data.name,
          yog: validatedFields.data.yog,
          collegeName: validatedFields.data.collegeName,
          leadState: validatedFields.data.leadState,
          language: validatedFields.data.language,
          leadSegment: validatedFields.data.leadSegment,
          tone: validatedFields.data.tone,
        },
      };
    } else {
      let message = "Failed to generate complete response from AI.";
      if (!result) message = "AI service returned no result.";
      else if (!result.salesResponses) message = "AI failed to generate sales responses.";
      else if (!result.usps) message = "AI failed to generate USPs.";
      return {
        message: message,
        salesResponseOutput: result || null,
        fields: { 
          leadInput: validatedFields.data.leadInput,
          name: validatedFields.data.name,
          yog: validatedFields.data.yog,
          collegeName: validatedFields.data.collegeName,
          leadState: validatedFields.data.leadState,
          language: validatedFields.data.language,
          leadSegment: validatedFields.data.leadSegment,
          tone: validatedFields.data.tone,
         },
      };
    }
  } catch (error) {
    console.error("Error generating sales response:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return {
      message: `An unexpected error occurred: ${errorMessage}. Please try again.`,
      salesResponseOutput: null,
      fields: { 
        leadInput,
        name: name || "",
        yog: yog || "",
        collegeName: collegeName || "",
        leadState: leadState || "",
        language,
        leadSegment,
        tone,
      },
    };
  }
}

export interface LogCallServerResponse {
    success: boolean;
    message: string;
    logId?: string; // Optional: ID of the saved log
}

export async function logCallAction(
  data: LogCallInput
): Promise<LogCallServerResponse> {
  const validatedData = LogCallInputSchema.safeParse(data);

  if (!validatedData.success) {
    console.error("Invalid data for logging call:", validatedData.error.issues);
    return {
      success: false,
      message: "Invalid data provided for logging. " + validatedData.error.issues.map(i => i.message).join(', '),
    };
  }

  try {
    // Simulate saving to a database
    console.log("--- LOGGING CALL ---");
    console.log("Lead Details:", JSON.stringify(validatedData.data.leadDetails, null, 2));
    console.log("Call Interactions:", JSON.stringify(validatedData.data.interactions, null, 2));
    console.log("Notes:", validatedData.data.notes);
    const logId = `log_${new Date().getTime()}`; // Simulate a log ID
    console.log("Call logged with ID:", logId);
    console.log("--- CALL LOGGED ---");
    
    // Here you would typically interact with your database (e.g., Firebase Firestore)
    // await db.collection('callLogs').add(validatedData.data);

    return {
      success: true,
      message: "Call has been successfully logged (simulated).",
      logId: logId,
    };
  } catch (error) {
    console.error("Error logging call:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return {
      success: false,
      message: `Failed to log call: ${errorMessage}`,
    };
  }
}


// Placeholder for fetching call logs
export interface CallLog extends LogCallInput {
  id: string;
  timestamp: string; 
}

let dummyCallLogs: CallLog[] = []; // In-memory store for dummy logs

// Modified logCallAction to also add to dummyCallLogs
export async function logCallActionAndStore(
  data: LogCallInput
): Promise<LogCallServerResponse> {
  const validatedData = LogCallInputSchema.safeParse(data);

  if (!validatedData.success) {
    console.error("Invalid data for logging call:", validatedData.error.issues);
    return {
      success: false,
      message: "Invalid data provided for logging. " + validatedData.error.issues.map(i => i.message).join(', '),
    };
  }

  try {
    const logId = `log_${new Date().getTime()}`;
    const newLog: CallLog = {
      ...validatedData.data,
      id: logId,
      timestamp: new Date().toISOString(),
    };
    
    dummyCallLogs.unshift(newLog); // Add to the beginning of the array
    if(dummyCallLogs.length > 50) dummyCallLogs.pop(); // Keep only last 50 logs for demo

    console.log("--- LOGGING CALL (and adding to dummy store) ---");
    console.log("Lead Details:", JSON.stringify(validatedData.data.leadDetails, null, 2));
    console.log("Call Interactions:", JSON.stringify(validatedData.data.interactions, null, 2));
    console.log("Notes:", validatedData.data.notes);
    console.log("Call logged with ID:", logId);
    console.log("--- CALL LOGGED (and stored in dummy store) ---");
    
    return {
      success: true,
      message: "Call has been successfully logged.",
      logId: logId,
    };
  } catch (error) {
    console.error("Error logging call:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return {
      success: false,
      message: `Failed to log call: ${errorMessage}`,
    };
  }
}


export async function getCallLogsAction(): Promise<CallLog[]> {
  // In a real application, you would fetch this from your database
  // For now, return the dummy data
  return Promise.resolve(dummyCallLogs);
}
