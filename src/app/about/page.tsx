"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useStore } from "@/app/lib/store";
import { FileText, MapPin } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  const { storeSettings } = useStore();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16 md:py-24 max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-headline font-bold text-primary mb-6">
            About <span className="text-accent italic">{storeSettings.name}</span>
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-body leading-relaxed">
            Discover the legacy and vision of artisanal woodcraft.
          </p>
        </div>

        {/* Corporate Identity Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest mb-4">
              <FileText className="h-4 w-4" />
              Corporate Identity
            </div>
            <h3 className="text-3xl md:text-5xl font-headline font-bold text-primary">Precision & Passion</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div className="relative w-full aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white bg-white transition-transform hover:scale-[1.02] duration-500">
              <Image 
                src="https://i.imgur.com/7OgCvps.jpeg"
                alt="V-WOOD Corporate Identity 1"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="relative w-full aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white bg-white transition-transform hover:scale-[1.02] duration-500">
              <Image 
                src="https://i.imgur.com/fcEIGt7.jpeg"
                alt="V-WOOD Corporate Identity 2"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </section>

        <div className="bg-primary rounded-[3rem] p-8 md:p-12 text-center text-primary-foreground relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row justify-center items-center gap-8">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-accent mb-1 text-center md:text-left">Visit Showroom</p>
              <a href={storeSettings.locationUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center md:justify-start gap-2 hover:text-accent transition-colors group">
                <MapPin className="h-4 w-4 text-accent group-hover:scale-110 transition-transform" />
                <p className="text-sm lowercase font-medium">{storeSettings.address}</p>
              </a>
            </div>
            <div className="h-px w-20 bg-white/10 md:h-12 md:w-px" />
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-accent mb-1 text-center md:text-left">Inquiries</p>
              <p className="text-sm font-medium">{storeSettings.email}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
