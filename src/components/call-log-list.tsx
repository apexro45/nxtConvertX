// src/components/call-log-list.tsx
"use client";

import type { CallLog } from "@/app/actions";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { FileText, User, StickyNote, Calendar, Languages, Users, SmilePlus, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

interface CallLogListProps {
  logs: CallLog[];
}

export function CallLogList({ logs }: CallLogListProps) {
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const toggleLogDetails = (logId: string) => {
    setSelectedLogId(prevId => (prevId === logId ? null : logId));
  };

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <Card key={log.id} className="shadow-md rounded-lg overflow-hidden">
          <CardHeader 
            className="p-4 bg-card hover:bg-muted/50 cursor-pointer flex flex-row justify-between items-center"
            onClick={() => toggleLogDetails(log.id)}
          >
            <div className="flex items-center">
              {selectedLogId === log.id ? <ChevronDown className="h-5 w-5 mr-2" /> : <ChevronRight className="h-5 w-5 mr-2" />}
              <FileText className="mr-3 h-6 w-6 text-primary"/>
              <div className="flex flex-col">
                <CardTitle className="text-lg font-semibold text-primary">
                  Log ID: {log.id}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Lead: {log.leadDetails.name || "N/A"}
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs py-1 px-2 whitespace-nowrap">
              <Calendar className="mr-1.5 h-3.5 w-3.5"/> {format(new Date(log.timestamp), "PPp")}
            </Badge>
          </CardHeader>
          {selectedLogId === log.id && (
            <CardContent className="p-4 sm:p-6 space-y-4 border-t bg-background">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-secondary/30 shadow-sm">
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
                <Card className="bg-secondary/30 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center font-medium text-primary"><StickyNote className="mr-2 h-5 w-5"/>BDA Notes</CardDescription>
                    </CardHeader>
                    <CardContent>
                    {log.notes ? (
                        <ScrollArea className="h-32 text-sm p-2 border rounded-md bg-card">
                            <p className="whitespace-pre-wrap">{log.notes}</p>
                        </ScrollArea>
                    ) : <p className="text-sm text-muted-foreground italic">No notes provided for this call.</p>}
                    </CardContent>
                </Card>
              </div>
              {/* Interactions section is removed as per requirement */}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
