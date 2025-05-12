
import { ConversionCopilotForm } from "@/components/conversion-copilot-form";
import { ConversionCopilotLogo } from "@/components/icons/conversion-copilot-logo";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-secondary text-foreground selection:bg-primary/20 selection:text-primary">
      <header className="w-full py-6 px-4 md:px-8 border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ConversionCopilotLogo className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Conversion Copilot
            </h1>
          </div>
          <Button asChild variant="outline" className="shadow-sm hover:shadow-md transition-shadow">
            <Link href="/call-logs">
              <FileText className="mr-2 h-5 w-5" />
              View Call Logs
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-grow w-full flex justify-center py-8 px-4">
        <div className="w-full max-w-6xl"> {/* Increased max-width for potentially wider layout */}
          <ConversionCopilotForm />
        </div>
      </main>
      <footer className="w-full py-4 px-4 md:px-8 text-center border-t border-border bg-card">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Conversion Copilot. Empowering Sales Conversations.
        </p>
      </footer>
    </div>
  );
}
