"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useStore } from "@/app/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { HelpCircle, Mail, MessageSquare, Phone, Send, ShieldCheck, Clock, ArrowRight, HeartHandshake } from "lucide-react";

export default function HelpCentre() {
  const { addHelpRequest, userName, userEmail } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: userName !== "Guest" ? userName : "",
    contact: userEmail || "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contact || !formData.message) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all fields so we can assist you better.",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate network delay
    setTimeout(() => {
      addHelpRequest({
        name: formData.name,
        contact: formData.contact,
        message: formData.message
      });
      
      toast({
        title: "Request Submitted",
        description: "Our artisanal support team has received your request and will contact you shortly.",
      });
      
      setFormData({
        name: userName !== "Guest" ? userName : "",
        contact: userEmail || "",
        message: ""
      });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            
            <div className="space-y-10 animate-in fade-in slide-in-from-left duration-700">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest">
                  <HelpCircle className="h-3 w-3" />
                  Concierge Support
                </div>
                <h1 className="text-5xl md:text-7xl font-headline font-bold text-primary leading-tight">
                  How can we <span className="text-accent underline decoration-primary/10 transition-all hover:decoration-accent/30 cursor-default">assist</span> you today?
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                  Whether you're inquiring about a vintage restoration or tracking a custom commission, our curators are here to help.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-8 rounded-[2rem] bg-white border border-primary/5 shadow-sm hover:shadow-xl transition-all group">
                  <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-6">
                    <Mail className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-primary text-lg mb-1">Email Inquiry</h3>
                  <p className="text-sm text-muted-foreground">support@vwoodquartz.com</p>
                </div>

                <div className="p-8 rounded-[2rem] bg-white border border-primary/5 shadow-sm hover:shadow-xl transition-all group">
                  <div className="h-12 w-12 rounded-2xl bg-accent/5 flex items-center justify-center text-accent group-hover:scale-110 transition-transform mb-6">
                    <Phone className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-primary text-lg mb-1">Direct Hotline</h3>
                  <p className="text-sm text-muted-foreground">+91 9727408352</p>
                </div>
              </div>

              <div className="p-10 rounded-[2.5rem] bg-primary text-primary-foreground shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 transition-transform group-hover:scale-110" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-accent" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Operational Hours</span>
                  </div>
                  <h4 className="text-2xl font-headline font-bold">Mon - Sat: 8 AM - 6 PM</h4>
                  <p className="text-sm text-white/60">Closed on Wednesdays for artisanal sourcing and workshop maintenance.</p>
                </div>
              </div>
            </div>

            <div className="animate-in fade-in slide-in-from-right duration-700 delay-200">
              <div className="p-8 md:p-12 rounded-[3.5rem] bg-white border border-primary/5 shadow-2xl relative">
                <div className="absolute -top-6 -right-6 h-24 w-24 bg-accent/10 rounded-full blur-3xl" />
                
                <div className="mb-10 space-y-2">
                  <h2 className="text-3xl font-headline font-bold text-primary">Open a Ticket</h2>
                  <p className="text-sm text-muted-foreground font-medium">Briefly describe your requirements below.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Collector's Name</Label>
                    <Input 
                      id="name"
                      placeholder="e.g. Alexander Hamilton"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="h-14 rounded-2xl bg-muted/30 border-none focus:bg-white focus:ring-2 focus:ring-accent/20 transition-all px-6 text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="contact" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email or Phone Number</Label>
                    <Input 
                      id="contact"
                      placeholder="e.g. alex@studio.com"
                      value={formData.contact}
                      onChange={(e) => setFormData({...formData, contact: e.target.value})}
                      className="h-14 rounded-2xl bg-muted/30 border-none focus:bg-white focus:ring-2 focus:ring-accent/20 transition-all px-6 text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="message" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Help Request / Inquiry</Label>
                    <Textarea 
                      id="message"
                      placeholder="Tell us about your concern or specific clock model..."
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="min-h-[160px] rounded-[2rem] bg-muted/30 border-none focus:bg-white focus:ring-2 focus:ring-accent/20 transition-all p-6 text-sm font-medium resize-none shadow-inner"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-16 bg-accent text-accent-foreground font-black text-lg rounded-2xl shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all gap-3"
                  >
                    {isSubmitting ? "Transmitting..." : "Submit Inquiry"}
                    {!isSubmitting && <Send className="h-5 w-5" />}
                  </Button>

                  <div className="flex items-center justify-center gap-3 opacity-30 pt-4">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-[8px] font-black uppercase tracking-widest leading-none">Secured Support Channel</span>
                  </div>
                </form>
              </div>
            </div>

          </div>

          <div className="mt-24 p-12 md:p-20 rounded-[4rem] bg-muted/20 border-2 border-dashed border-primary/10 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left transition-all hover:bg-muted/30">
            <div className="space-y-4">
              <div className="flex items-center justify-center md:justify-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl">
                  <HeartHandshake className="h-6 w-6" />
                </div>
                <h3 className="text-4xl font-headline font-bold text-primary">Artisanal Warranty</h3>
              </div>
              <p className="text-lg text-muted-foreground max-w-xl">
                Every V-WOOD timepiece comes with a global 2-year warranty covering technical movements and structural integrity.
              </p>
            </div>
            <Button variant="outline" className="h-14 px-10 rounded-full border-primary text-primary font-bold hover:bg-primary hover:text-white group">
              View Policy
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
