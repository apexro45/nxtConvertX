
"use client";

import { useActionState, useEffect, useRef, useState, useMemo } from "react";
import { useFormStatus } from "react-dom";
import { MessageSquare, Zap, Users, Smile, Drama, ArrowRight, Loader2, AlertTriangle, User, CalendarDays, School, MapPin, Languages, Notebook, PhoneCall, PhoneOff, RefreshCcw, Save, FileText } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { handleGenerateResponseAction, logCallActionAndStore as logCallAction, type FormState, type GenerateSalesResponseInput, type CallInteraction, type LogCallInput, getCallLogsAction, CallLog } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "./ui/scroll-area";
import { indianStates } from "@/lib/indian-states";


type Phase = 'leadDetails' | 'inCall';
type LanguageOption = "english" | "hindi" | "telugu" | "tamil";


const initialSalesFormState: FormState = {
  message: null,
  salesResponseOutput: null,
  fields: {},
  issues: [],
};


const commonObjections = [
  { id: "fees", text: "The course fees are too high." },
  { id: "job", text: "Will this program actually help me get a job?" },
  { id: "time", text: "I don't have enough time for this course." },
  { id: "value", text: "I'm not sure if this is worth the investment." },
];

function GetReplyButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 rounded-lg">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          Get Reply <Zap className="ml-2 h-5 w-5" />
        </>
      )}
    </Button>
  );
}


export function ConversionCopilotForm() {
  const [phase, setPhase] = useState<Phase>('leadDetails');
  const { toast } = useToast();

  // Lead Details State
  const [name, setName] = useState("");
  const [yog, setYog] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [leadStateValue, setLeadStateValue] = useState("");
  const [language, setLanguage] = useState<LanguageOption>("english");
  const [leadSegment, setLeadSegment] = useState<"student" | "jobseeker" | "parent">("student");
  const [tone, setTone] = useState<"Friendly" | "Assertive" | "Empathetic">("Friendly");
  const [leadDetailsFormIssues, setLeadDetailsFormIssues] = useState<string[]>([]);

  // Stored Lead Details for the call
  const [currentLeadDetails, setCurrentLeadDetails] = useState<Omit<GenerateSalesResponseInput, 'leadInput'> | null>(null);


  // In-Call State
  const [currentLeadQuery, setCurrentLeadQuery] = useState("");
  const [callHistory, setCallHistory] = useState<CallInteraction[]>([]);
  const [salesResponseState, salesResponseAction, isSalesPending] = useActionState(handleGenerateResponseAction, initialSalesFormState);
  
  const [callNotes, setCallNotes] = useState(""); 
  const [isLoggingCall, setIsLoggingCall] = useState(false);

  const salesFormRef = useRef<HTMLFormElement>(null);
  const lastProcessedLeadInputRef = useRef<string | null>(null);


  useEffect(() => {
    if (salesResponseState?.message) {
      // Check if this specific response has already been processed by comparing the lead input
      if (salesResponseState.fields?.leadInput === lastProcessedLeadInputRef.current) {
        return;
      }

      if (salesResponseState.message === "Response generated successfully.") {
        if (salesResponseState.salesResponseOutput?.salesResponses && salesResponseState.salesResponseOutput?.usps && salesResponseState.fields?.leadInput) {
          setCallHistory(prevHistory => {
            const newInteraction: CallInteraction = {
              leadInput: salesResponseState.fields!.leadInput!,
              salesResponses: salesResponseState.salesResponseOutput!.salesResponses!,
              usps: salesResponseState.salesResponseOutput!.usps!,
            };
            return [...prevHistory, newInteraction];
          });
          setCurrentLeadQuery(""); 
          lastProcessedLeadInputRef.current = salesResponseState.fields.leadInput; // Mark as processed
        } else {
          toast({
            title: "Response Incomplete",
            description: "AI generated a success message but crucial response data is missing.",
            variant: "destructive",
          });
        }
      } else if (salesResponseState.message && !(salesResponseState.issues && salesResponseState.issues.length > 0)) {
        toast({
          title: "Error Generating Response",
          description: salesResponseState.message,
          variant: "destructive",
        });
      }
    }
  }, [salesResponseState, toast]);


  const handleStartCall = () => {
    const issues: string[] = [];
    if (!name.trim()) issues.push("Name is required.");
    if (!leadSegment) issues.push("Lead segment is required.");
    if (!tone) issues.push("Desired tone is required.");
    if (!leadStateValue) issues.push("State is required.");

    if (issues.length > 0) {
      setLeadDetailsFormIssues(issues);
      toast({ title: "Validation Error", description: issues.join("\n"), variant: "destructive" });
      return;
    }
    setLeadDetailsFormIssues([]);
    const details: Omit<GenerateSalesResponseInput, 'leadInput'> = {
      name, yog, collegeName, leadState: leadStateValue, language, leadSegment, tone
    };
    setCurrentLeadDetails(details);
    setPhase('inCall');
    setCallHistory([]);
    setCurrentLeadQuery("");
    setCallNotes("");
    lastProcessedLeadInputRef.current = null; 
  };

 const handleEndCall = async () => {
    if (!currentLeadDetails) {
      toast({ title: "Error", description: "Lead details are missing for logging.", variant: "destructive" });
      return;
    }
    setIsLoggingCall(true);
    try {
      const logData: LogCallInput = {
        leadDetails: currentLeadDetails,
        interactions: callHistory,
        notes: callNotes,
      };
      const result = await logCallAction(logData);

      if (result.success) {
        toast({
          title: "Call Logged Successfully!",
          description: result.message || "The call details have been saved.",
        });
      } else {
        toast({
          title: "Error Logging Call",
          description: result.message || "An unknown error occurred while logging the call.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error Logging Call",
        description: error instanceof Error ? error.message : "An unexpected server error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingCall(false);
      handleStartNewCall(); 
    }
  };

  const handleStartNewCall = () => {
    setPhase('leadDetails');
    setName("");
    setYog("");
    setCollegeName("");
    setLeadStateValue("");
    setLanguage("english");
    setLeadSegment("student");
    setTone("Friendly");
    setCurrentLeadDetails(null);
    setCallHistory([]);
    setCurrentLeadQuery("");
    setCallNotes("");
    setLeadDetailsFormIssues([]);
    lastProcessedLeadInputRef.current = null;
    if (salesFormRef.current) {
      salesFormRef.current.reset();
    }
    // More robust reset for useActionState if direct reset isn't available.
    // This might involve re-keying the component or manually setting initialSalesFormState to salesResponseState.
    // For now, we assume child component re-renders triggered by state changes are sufficient.
  };
  
  const getFieldIssue = (fieldName: string, state: FormState | null) => {
    if (!state?.fields || !state.issues) return undefined;
    const issue = state.issues.find(issue => 
      issue.toLowerCase().includes(fieldName.toLowerCase()) || 
      (fieldName === "leadStateValue" && issue.toLowerCase().includes("state"))
    );
    return issue;
  };


  const renderLeadDetailsForm = () => (
    <Card className="shadow-xl rounded-xl overflow-hidden bg-card/95 backdrop-blur-lg border-primary/30 transition-all duration-300 hover:shadow-2xl">
      <CardHeader className="bg-gradient-to-br from-primary/15 via-primary/5 to-accent/15 p-6">
        <CardTitle className="flex items-center text-3xl font-bold text-primary">
          <User className="mr-3 h-8 w-8" />
          Lead Details
        </CardTitle>
        <CardDescription className="text-foreground/80 text-base">
          Enter lead information before starting the call.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {leadDetailsFormIssues.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Please fix the following errors:</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside">
                {leadDetailsFormIssues.map((issue, idx) => <li key={idx}>{issue}</li>)}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name" className="text-md font-medium flex items-center text-foreground/90">
              <User className="mr-2 h-5 w-5 text-primary" /> Name *
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Priya Sharma" className="mt-2 text-base bg-background/80 border-border focus:border-primary focus:ring-primary/50 rounded-md shadow-sm" />
          </div>
          <div>
            <Label htmlFor="yog" className="text-md font-medium flex items-center text-foreground/90">
              <CalendarDays className="mr-2 h-5 w-5 text-primary" /> Year of Graduation
            </Label>
            <Input id="yog" value={yog} onChange={(e) => setYog(e.target.value)} placeholder="e.g., 2024 or Pursuing" className="mt-2 text-base bg-background/80 border-border focus:border-primary focus:ring-primary/50 rounded-md shadow-sm" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="collegeName" className="text-md font-medium flex items-center text-foreground/90">
              <School className="mr-2 h-5 w-5 text-primary" /> College Name
            </Label>
            <Input id="collegeName" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} placeholder="e.g., IIT Bombay" className="mt-2 text-base bg-background/80 border-border focus:border-primary focus:ring-primary/50 rounded-md shadow-sm" />
          </div>
          <div>
            <Label htmlFor="leadStateValue" className="text-md font-medium flex items-center text-foreground/90">
                <MapPin className="mr-2 h-5 w-5 text-primary" /> State *
            </Label>
            <Select value={leadStateValue} onValueChange={setLeadStateValue}>
                <SelectTrigger id="leadStateValue" className="mt-2 text-base bg-background/80 border-border focus:border-primary focus:ring-primary/50 rounded-md shadow-sm">
                    <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                    {indianStates.map((state) => (
                        <SelectItem key={state.code} value={state.name}>
                            {state.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="leadSegment" className="text-md font-medium flex items-center text-foreground/90"><Users className="mr-2 h-5 w-5 text-primary" /> Lead Segment *</Label>
            <Select value={leadSegment} onValueChange={(v: "student" | "jobseeker" | "parent") => setLeadSegment(v)}>
              <SelectTrigger id="leadSegment" className="mt-2 text-base"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="student">Student</SelectItem><SelectItem value="jobseeker">Jobseeker</SelectItem><SelectItem value="parent">Parent</SelectItem></SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="tone" className="text-md font-medium flex items-center text-foreground/90"><Smile className="mr-2 h-5 w-5 text-primary" /> Desired Tone *</Label>
            <Select value={tone} onValueChange={(v: "Friendly" | "Assertive" | "Empathetic") => setTone(v)}>
              <SelectTrigger id="tone" className="mt-2 text-base"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="Friendly">Friendly</SelectItem><SelectItem value="Assertive">Assertive</SelectItem><SelectItem value="Empathetic">Empathetic</SelectItem></SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="language" className="text-md font-medium flex items-center text-foreground/90"><Languages className="mr-2 h-5 w-5 text-primary" /> Language</Label>
            <Select value={language} onValueChange={(v: LanguageOption) => setLanguage(v)}>
              <SelectTrigger id="language" className="mt-2 text-base"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="english">English</SelectItem><SelectItem value="hindi">Hindi</SelectItem><SelectItem value="telugu">Telugu</SelectItem><SelectItem value="tamil">Tamil</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 flex justify-end bg-primary/5">
        <Button onClick={handleStartCall} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg rounded-lg px-6 py-3 text-base font-semibold">
          <PhoneCall className="mr-2 h-5 w-5" /> Call Begin
        </Button>
      </CardFooter>
    </Card>
  );

  const renderInCallUI = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-4">
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl text-primary flex items-center"><User className="mr-2"/>Lead Details</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p><strong>Name:</strong> {currentLeadDetails?.name}</p>
            <p><strong>Segment:</strong> {currentLeadDetails?.leadSegment}</p>
            <p><strong>YOG:</strong> {currentLeadDetails?.yog || 'N/A'}</p>
            <p><strong>College:</strong> {currentLeadDetails?.collegeName || 'N/A'}</p>
            <p><strong>State:</strong> {currentLeadDetails?.leadState || 'N/A'}</p>
            <p><strong>Language:</strong> {currentLeadDetails?.language}</p>
            <p><strong>Tone:</strong> {currentLeadDetails?.tone}</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl text-primary flex items-center"><Notebook className="mr-2"/>Call Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              id="liveCallNotes"
              value={callNotes} 
              onChange={(e) => setCallNotes(e.target.value)}
              rows={8}
              placeholder="Jot down notes, key points, and follow-up actions during the call..."
              className="mt-1 text-base bg-background/80 border-border focus:border-primary focus:ring-primary/50 rounded-md shadow-sm"
            />
          </CardContent>
        </Card>
        <Button onClick={handleEndCall} variant="destructive" className="w-full shadow-lg rounded-lg text-base font-semibold py-3" disabled={isLoggingCall}>
            {isLoggingCall ? (
                <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Logging Call...
                </>
            ) : (
                <>
                    <PhoneOff className="mr-2 h-5 w-5" /> End Call & Log
                </>
            )}
        </Button>
        <Button onClick={handleStartNewCall} variant="outline" className="w-full shadow-lg rounded-lg border-accent text-accent hover:bg-accent/10 text-base font-semibold py-3">
          <RefreshCcw className="mr-2 h-5 w-5" /> Start New Call Session
        </Button>
      </div>

      <div className="md:col-span-2 space-y-6">
        <form ref={salesFormRef} action={salesResponseAction} className="space-y-6">
          {/* Hidden fields for lead details */}
          <input type="hidden" name="name" value={currentLeadDetails?.name || ""} />
          <input type="hidden" name="yog" value={currentLeadDetails?.yog || ""} />
          <input type="hidden" name="collegeName" value={currentLeadDetails?.collegeName || ""} />
          <input type="hidden" name="leadState" value={currentLeadDetails?.leadState || ""} />
          <input type="hidden" name="language" value={currentLeadDetails?.language || "english"} />
          <input type="hidden" name="leadSegment" value={currentLeadDetails?.leadSegment || "student"} />
          <input type="hidden" name="tone" value={currentLeadDetails?.tone || "Friendly"} />

          <Card className="shadow-xl rounded-xl">
            <CardHeader className="bg-gradient-to-br from-accent/15 via-accent/5 to-primary/15 p-6">
              <CardTitle className="flex items-center text-2xl font-bold text-accent"><MessageSquare className="mr-3 h-7 w-7" />Lead's Input</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="currentLeadQuery" className="text-md font-medium">Lead's Comment/Question *</Label>
                <Textarea id="currentLeadQuery" name="leadInput" value={currentLeadQuery} onChange={(e) => setCurrentLeadQuery(e.target.value)} rows={3} placeholder="Enter lead's current statement..." className="mt-1" required minLength={3}/>
                {getFieldIssue("leadInput", salesResponseState) && (
                  <p className="text-sm text-destructive mt-1">{getFieldIssue("leadInput", salesResponseState)}</p>
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center text-foreground/90"><Drama className="mr-2 h-4 w-4 text-accent" />Quick Select Common Objections</h4>
                 <div className="flex flex-wrap gap-2">
                  {commonObjections.map(objection => (
                    <Button 
                      key={objection.id} 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setCurrentLeadQuery(objection.text)}
                      className="border-primary/50 text-primary bg-primary/10 hover:bg-primary hover:text-primary-foreground rounded-full px-3 py-1.5 text-xs sm:text-sm group transition-all duration-200 ease-in-out transform hover:scale-105 shadow-sm hover:shadow-md focus:ring-2 focus:ring-primary/50 focus:outline-none active:bg-primary/80"
                    >
                      {objection.text} <ArrowRight className="ml-1.5 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </Button>
                  ))}
                </div>
              </div>
               <div className="flex justify-end pt-2">
                <GetReplyButton />
              </div>
            </CardContent>
          </Card>
        </form>

        {(isSalesPending || callHistory.length > 0 || (salesResponseState?.message && !salesResponseState.salesResponseOutput?.salesResponses && !(salesResponseState.issues && salesResponseState.issues.length > 0))) && (
          <Card className="shadow-xl rounded-xl">
            <CardHeader className="bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 p-6">
              <CardTitle className="flex items-center text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
                <Zap className="mr-3 h-7 w-7 text-primary" />AI Suggestions & Call Log
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ScrollArea className="h-[calc(100vh-700px)] min-h-[200px] pr-4"> 
                {callHistory.map((interaction, index) => (
                  <div key={index} className="mb-4 pb-4 border-b last:border-b-0">
                    <p className="font-semibold text-muted-foreground">Lead: <span className="font-normal text-foreground">{interaction.leadInput}</span></p>
                    <div className="mt-2 space-y-2">
                      <h5 className="text-sm font-semibold text-primary">Suggested Replies:</h5>
                      {interaction.salesResponses.map((resp, i) => <p key={`resp-${index}-${i}`} className="text-sm p-2 bg-secondary/70 rounded-md">{resp}</p>)}
                      <h5 className="text-sm font-semibold text-accent mt-1">Key USPs:</h5>
                      <ul className="list-disc list-inside pl-4 space-y-1">
                        {interaction.usps.map((usp, i) => <li key={`usp-${index}-${i}`} className="text-sm">{usp}</li>)}
                      </ul>
                    </div>
                  </div>
                ))}
                {isSalesPending && (
                  <div className="space-y-2 mt-4">
                    <Skeleton className="h-6 w-3/4 rounded-md bg-muted/70" />
                    <Skeleton className="h-10 w-full rounded-md bg-muted/70" />
                    <Skeleton className="h-10 w-full rounded-md bg-muted/70" />
                  </div>
                )}
                {salesResponseState?.message && !salesResponseState.salesResponseOutput?.salesResponses && !(salesResponseState.issues && salesResponseState.issues.length > 0) && (
                  <Alert variant="destructive" className="mt-4"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{salesResponseState.message}</AlertDescription></Alert>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );


  return (
    <div className="w-full mx-auto p-0 sm:p-2 md:p-4 space-y-8">
      {phase === 'leadDetails' && renderLeadDetailsForm()}
      {phase === 'inCall' && renderInCallUI()}
    </div>
  );
}

    
