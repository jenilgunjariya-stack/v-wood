
"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, History, Loader2, ArrowRight, Home as HomeIcon } from "lucide-react";
import { aiStyleAssistant, AIStyleAssistantOutput } from "@/ai/flows/ai-style-assistant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function AssistantPage() {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIStyleAssistantOutput | null>(null);

  const handleConsult = async () => {
    if (!description.trim()) return;
    setLoading(true);
    try {
      const output = await aiStyleAssistant({ roomDescription: description });
      setResult(output);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 md:py-24 max-w-4xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 text-accent mb-6">
            <Sparkles className="h-8 w-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary mb-4">Interior Style Assistant</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-body">
            Tell us about your home's decor, and our AI will recommend the perfect clock styles to complement your space.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          <div className="md:col-span-3 space-y-8">
            <div className="space-y-4">
              <label className="text-lg font-headline font-bold text-primary flex items-center gap-2">
                <HomeIcon className="h-5 w-5 text-accent" />
                Describe your room
              </label>
              <Textarea 
                placeholder="E.g., I have a sunlit living room with minimalist Scandinavian furniture, white walls, and light oak floors. I love natural materials and clean lines..."
                className="min-h-[200px] text-lg p-6 bg-white shadow-inner border-2 focus:border-accent transition-all rounded-2xl"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Button 
                size="lg" 
                className="w-full h-14 text-lg font-bold bg-accent hover:bg-accent/90 text-accent-foreground rounded-2xl group"
                onClick={handleConsult}
                disabled={loading || !description.trim()}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-5 w-5" />
                )}
                {loading ? "Analyzing..." : "Get Recommendations"}
              </Button>
            </div>
            
            <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
              <h4 className="font-headline font-bold text-primary mb-2 flex items-center gap-2">
                <History className="h-4 w-4" /> Examples
              </h4>
              <div className="flex flex-wrap gap-2">
                {["Industrial loft with brick walls", "Classic vintage study", "Bright modern apartment"].map(ex => (
                  <button 
                    key={ex} 
                    className="text-xs bg-white hover:bg-accent hover:text-white border px-3 py-1.5 rounded-full transition-colors"
                    onClick={() => setDescription(ex)}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            {result ? (
              <Card className="border-none shadow-2xl bg-white overflow-hidden animate-in fade-in slide-in-from-right duration-500">
                <CardHeader className="bg-accent text-accent-foreground p-6">
                  <CardTitle className="font-headline text-xl">Our Recommendation</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Suggested Styles</h4>
                    <div className="flex flex-wrap gap-3">
                      {result.recommendedStyles.map((style, i) => (
                        <span key={i} className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
                          {style}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Why these?</h4>
                    <p className="text-primary/80 leading-relaxed italic">"{result.explanation}"</p>
                  </div>

                  <Button asChild className="w-full bg-primary hover:bg-primary/90">
                    <Link href="/">
                      Shop These Styles
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="h-full min-h-[300px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-8 text-center bg-white/50">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-body">Fill out the description to get AI-powered recommendations.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
