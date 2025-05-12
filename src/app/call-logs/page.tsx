// src/app/call-logs/page.tsx
import { getCallLogsAction, type CallLog } from "@/app/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { FileText, User, MessageSquare, Zap, StickyNote, Calendar, Languages, Users, SmilePlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ConversionCopilotLogo } from "@/components/icons/conversion-copilot-logo";

export default async function CallLogsPage() {
  const logs = await getCallLogsAction();

  return (
    <div className="min-h-screen flex flex-col bg-secondary text-foreground">
      <header className="w-full py-6 px-4 md:px-8 border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ConversionCopilotLogo className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Call Logs
            </h1>
          </div>
          <Button asChild variant="outline">
            <Link href="/">Back to Copilot</Link>
          </Button>
        </div>
      </header>
      <main className="flex-grow w-full flex justify-center py-8 px-4">
        <div className="w-full max-w-4xl space-y-6">
          {logs.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Call Logs Found</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Completed calls will appear here once they are logged.
                </p>
              </CardContent>
            </Card>
          ) : (
            logs.map((log) => (
              <Card key={log.id} className="shadow-lg rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-primary/10 via-card to-accent/10 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <CardTitle className="text-2xl font-semibold text-primary flex items-center">
                       <FileText className="mr-3 h-7 w-7"/> Log ID: {log.id}
                    </CardTitle>
                    <Badge variant="secondary" className="text-sm py-1 px-3">
                      <Calendar className="mr-2 h-4 w-4"/> {format(new Date(log.timestamp), "PPpp")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-secondary/50">
                      <CardHeader className="pb-2">
                        <CardDescription className="flex items-center font-medium text-primary"><User className="mr-2 h-5 w-5"/>Lead Details</CardDescription>
                      </CardHeader>
                      <CardContent className="text-sm space-y-1">
                        <p><strong>Name:</strong> {log.leadDetails.name || "N/A"}</p>
                        <p><Users className="inline mr-1 h-4 w-4"/><strong>Segment:</strong> {log.leadDetails.leadSegment}</p>
                        <p><Calendar className="inline mr-1 h-4 w-4"/><strong>YOG:</strong> {log.leadDetails.yog || "N/A"}</p>
                        <p><strong>College:</strong> {log.leadDetails.collegeName || "N/A"}</p>
                        <p><strong>State:</strong> {log.leadDetails.leadState || "N/A"}</p>
                        <p><Languages className="inline mr-1 h-4 w-4"/><strong>Language:</strong> {log.leadDetails.language}</p>
                        <p><SmilePlus className="inline mr-1 h-4 w-4"/><strong>Tone:</strong> {log.leadDetails.tone}</p>
                      </CardContent>
                    </Card>
                     <Card className="bg-secondary/50">
                        <CardHeader className="pb-2">
                           <CardDescription className="flex items-center font-medium text-primary"><StickyNote className="mr-2 h-5 w-5"/>BDA Notes</CardDescription>
                        </CardHeader>
                        <CardContent>
                        {log.notes ? (
                            <ScrollArea className="h-32 text-sm p-2 border rounded-md bg-background">
                                <p className="whitespace-pre-wrap">{log.notes}</p>
                            </ScrollArea>
                        ) : <p className="text-sm text-muted-foreground italic">No notes provided for this call.</p>}
                        </CardContent>
                    </Card>
                  </div>
                  
                  <Separator />

                  <div>
                    <h4 className="text-lg font-semibold mb-2 text-accent flex items-center"><MessageSquare className="mr-2 h-5 w-5"/>Call Interactions</h4>
                    {log.interactions.length === 0 ? (
                       <p className="text-sm text-muted-foreground italic">No interactions recorded.</p>
                    ) : (
                        <ScrollArea className="h-60 border rounded-md p-3 bg-background/50">
                        {log.interactions.map((interaction, index) => (
                            <div key={index} className="mb-3 pb-3 border-b last:border-b-0 border-border/70">
                            <p className="font-medium text-sm text-muted-foreground">Lead: <span className="font-normal text-foreground">{interaction.leadInput}</span></p>
                            <div className="mt-1.5 space-y-1.5 pl-2">
                                <h5 className="text-xs font-semibold text-primary/80">Suggested Replies:</h5>
                                {interaction.salesResponses.map((resp, i) => (
                                <p key={`resp-${index}-${i}`} className="text-xs p-1.5 bg-secondary/30 rounded">{resp}</p>
                                ))}
                                <h5 className="text-xs font-semibold text-accent/80 mt-1">Key USPs:</h5>
                                <ul className="list-disc list-inside pl-3 space-y-0.5">
                                {interaction.usps.map((usp, i) => (
                                    <li key={`usp-${index}-${i}`} className="text-xs">{usp}</li>
                                ))}
                                </ul>
                            </div>
                            </div>
                        ))}
                        </ScrollArea>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
      <footer className="w-full py-4 px-4 md:px-8 text-center border-t border-border bg-card">
        <p className="text-sm text-muted-foreground">
          Conversion Copilot Call Log Archive
        </p>
      </footer>
    </div>
  );
}
