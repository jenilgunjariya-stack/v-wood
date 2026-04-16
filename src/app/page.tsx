
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { ClockCard } from "@/components/clocks/ClockCard";
import { useStore } from "@/app/lib/store";
import { Button } from "@/components/ui/button";
import { Layers, Search, X, MapPin, Mail, Instagram, Facebook, Phone, Globe, ShieldCheck, User, Clock as ClockIcon, ArrowRight, Zap, Watch, AlarmClock, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

function HomeContent() {
  const { products, searchQuery, setSearchQuery, storeSettings, userName, userPhoto } = useStore();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory(null);
    }
  }, [categoryParam]);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const inStockProducts = products.filter(p => p.stock > 0);
  const filteredProducts = inStockProducts.filter(clock => {
    const matchesSearch = clock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         clock.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         clock.style.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || clock.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-accent/40">
      <Navbar />
      
      <main className="flex-1">
        {/* Luxury Hero Section - Centered Luxury Look */}
        <section className="relative min-h-[85vh] flex flex-col items-center justify-start bg-[#0a0a0a] overflow-hidden pt-16 pb-24">
          {/* Ambient Background Texture/Glow */}
          <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-10 grayscale" />
             <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/80 via-transparent to-[#0a0a0a]" />
          </div>

          <div className="wide-container relative z-10 w-full flex flex-col items-center text-center space-y-12">
            {/* Logo Signature */}
            <div className="animate-in fade-in slide-in-from-top duration-1000">
               <div className="w-36 h-16 relative mx-auto luxury-glow">
                  <img src={storeSettings.logoUrl} alt="V-WOOD" className="w-full h-full object-contain" />
               </div>
            </div>

            {/* Main Statement */}
            <div className="space-y-4 animate-in fade-in zoom-in duration-1000 delay-200">
               <h1 className="flex flex-col md:flex-row items-center justify-center gap-x-8 leading-none">
                  <span className="text-6xl md:text-[110px] font-headline font-black text-white tracking-[0.05em] uppercase mb-2 md:mb-0">TIMELESS</span>
                  <span className="text-6xl md:text-[90px] font-['Great_Vibes'] text-accent lowercase">luxury</span>
               </h1>
               <div className="flex items-center justify-center gap-6">
                  <div className="h-[1.5px] w-16 bg-accent/30" />
                  <p className="text-[11px] font-bold text-accent uppercase tracking-[0.8em] whitespace-nowrap">CRAFTED WITH PRECISION</p>
                  <div className="h-[1.5px] w-16 bg-accent/30" />
               </div>
            </div>

            {/* Digital Precision Clock */}
            <div className="animate-in fade-in slide-in-from-bottom duration-1000 delay-400">
               <div className="inline-flex items-center justify-center px-14 py-7 rounded-[3rem] bg-[#111111] border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] group transition-all hover:border-accent/40 luxury-glow">
                  <span className="text-5xl md:text-7xl font-['Montserrat'] text-accent font-bold tracking-[0.15em]">
                    {currentTime || "09:40:40 PM"}
                  </span>
               </div>
            </div>

            {/* Centerpiece Showcase & Explore Button Group */}
            <div className="relative w-full flex flex-col items-center gap-12 animate-in fade-in slide-in-from-bottom duration-[1.5s] delay-600">
               <div className="relative group max-w-5xl w-full">
                  <div className="absolute inset-[-8%] bg-accent/5 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  <div className="relative aspect-[16/7] md:aspect-[16/6] w-full rounded-[4rem] luxury-border luxury-glow overflow-hidden bg-black shadow-2xl scale-100 group-hover:scale-[1.01] transition-all duration-1000">
                     <img
                       src={storeSettings.heroImageUrl}
                       alt="Heritage Piece"
                       className="w-full h-full object-cover transition-transform duration-[6s] group-hover:scale-105"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 opacity-70" />
                     <div className="absolute inset-0 border-[20px] border-[#0a0a0a]/60 pointer-events-none" />
                  </div>
               </div>

               <Button asChild className="h-20 px-16 rounded-full luxury-button text-xl font-bold transition-all relative group overflow-hidden shadow-[0_20px_50px_-10px_rgba(212,175,55,0.4)]">
                  <Link href="#collection">
                     <span className="relative z-10 uppercase tracking-[0.2em]">Explore Collection</span>
                     <div className="absolute inset-0 bg-white/10 translate-y-20 group-hover:translate-y-0 transition-transform duration-500" />
                  </Link>
               </Button>
            </div>
          </div>
        </section>
        {/* Secondary Statement & Features */}
        <section className="py-32 bg-[#050505] text-center border-t border-white/5">
           <div className="wide-container space-y-24">
              <div className="animate-in fade-in slide-in-from-bottom duration-1000">
                 <h2 className="flex flex-col md:flex-row items-center justify-center gap-x-6">
                    <span className="text-4xl md:text-6xl font-['Great_Vibes'] text-accent italic lowercase">precision</span>
                    <span className="text-4xl md:text-6xl font-headline font-black text-white uppercase tracking-widest">MEETS HERITAGE</span>
                 </h2>
                 <div className="h-0.5 w-32 bg-accent/20 mx-auto mt-8" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
                 <div className="flex flex-col items-center space-y-8 group">
                    <div className="h-20 w-20 rounded-full luxury-border flex items-center justify-center bg-white/5 shadow-2xl transition-all group-hover:scale-110 group-hover:bg-accent group-hover:text-accent-foreground">
                       <Zap className="h-8 w-8 text-accent group-hover:text-inherit" />
                    </div>
                    <div className="space-y-3">
                       <h3 className="text-white font-bold text-xs tracking-[0.3em] uppercase">Handcrafted Design</h3>
                       <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest max-w-[200px] leading-relaxed">
                          Meticulously carved from the finest natural timber.
                       </p>
                    </div>
                 </div>

                 <div className="flex flex-col items-center space-y-8 group">
                    <div className="h-20 w-20 rounded-full luxury-border flex items-center justify-center bg-white/5 shadow-2xl transition-all group-hover:scale-110 group-hover:bg-accent group-hover:text-accent-foreground">
                       <ClockIcon className="h-8 w-8 text-accent group-hover:text-inherit" />
                    </div>
                    <div className="space-y-3">
                       <h3 className="text-white font-bold text-xs tracking-[0.3em] uppercase">Silent Movement</h3>
                       <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest max-w-[200px] leading-relaxed">
                          World-class quartz tech for absolute silence.
                       </p>
                    </div>
                 </div>

                 <div className="flex flex-col items-center space-y-8 group">
                    <div className="h-20 w-20 rounded-full luxury-border flex items-center justify-center bg-white/5 shadow-2xl transition-all group-hover:scale-110 group-hover:bg-accent group-hover:text-accent-foreground">
                       <ShieldCheck className="h-8 w-8 text-accent group-hover:text-inherit" />
                    </div>
                    <div className="space-y-3">
                       <h3 className="text-white font-bold text-xs tracking-[0.3em] uppercase">Premium Quartz</h3>
                       <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest max-w-[200px] leading-relaxed">
                          Uncompromising precision in every single second.
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Visual Category Menu - Luxury Dark Squares */}
        <section className="py-24 bg-[#0a0a0a]">
          <div className="wide-container">
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
              <button 
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "group flex flex-col items-center justify-center gap-4 w-40 h-40 rounded-[2.5rem] transition-all duration-500 border shadow-2xl",
                  selectedCategory === null ? "bg-[#141414] border-accent/60 luxury-glow scale-105" : "bg-[#111111] border-white/5 hover:border-accent/40"
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  <Layers className="h-6 w-6" />
                </div>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-[0.4em] transition-colors",
                  selectedCategory === null ? "text-accent" : "text-white/40 group-hover:text-white"
                )}>All Collection</span>
              </button>
 
              {[
                { label: "Wall Clocks", cat: "Wall Clock", icon: ClockIcon },
                { label: "Alarm Clocks", cat: "Alarm Clock", icon: AlarmClock },
                { label: "Hand Watches", cat: "Hand Watch", icon: Watch },
                { label: "Photo Frames", cat: "Photo Frame", icon: ImageIcon }
              ].map((item) => (
                <button 
                  key={item.cat}
                  onClick={() => setSelectedCategory(item.cat)}
                  className={cn(
                    "group flex flex-col items-center justify-center gap-4 w-40 h-40 rounded-[2.5rem] transition-all duration-500 border shadow-2xl",
                    selectedCategory === item.cat ? "bg-[#141414] border-accent/60 luxury-glow scale-105" : "bg-[#111111] border-white/5 hover:border-accent/40"
                  )}
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-[0.4em] transition-colors",
                    selectedCategory === item.cat ? "text-accent" : "text-white/40 group-hover:text-white"
                  )}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Collection Section */}
        <section id="collection" className="py-24 wide-container">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-20 gap-12">
            <div className="max-w-3xl w-full">
              <h2 className="v-section-heading">
                {selectedCategory ? `${selectedCategory} Collection` : "The Full Collection"}
              </h2>
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl">Each piece is a unique dialogue between the craftsman and the grain.</p>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative group flex-1 w-full max-w-xl">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                  <Input 
                    placeholder="Find your timepiece..." 
                    className="pl-14 h-16 rounded-2xl border-2 focus:border-accent transition-all bg-white text-lg shadow-sm w-full font-bold uppercase tracking-widest"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            selectedCategory === null && searchQuery === "" ? (
              <div className="space-y-24">
                {["Wall Clock", "Alarm Clock", "Hand Watch", "Photo Frame"].map(cat => {
                  const catProducts = filteredProducts.filter(p => p.category === cat);
                  if (catProducts.length === 0) return null;
                  return (
                    <div key={cat} className="space-y-12 animate-in fade-in slide-in-from-bottom duration-1000">
                      <div className="flex items-center gap-8">
                        <div className="flex flex-col">
                          <h3 className="text-4xl font-headline font-bold text-primary">{cat}s</h3>
                          <div className="h-1.5 w-20 bg-accent mt-2 rounded-full" />
                        </div>
                        <div className="h-px flex-1 bg-primary/10" />
                        <Button 
                          variant="ghost" 
                          className="text-xs font-bold uppercase tracking-widest text-accent hover:text-accent/80 p-0"
                          onClick={() => setSelectedCategory(cat)}
                        >
                          View All {cat}s <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-10">
                        {catProducts.map((clock) => (
                          <ClockCard key={clock.id} clock={clock} />
                        ))}
                      </div>
                    </div>
                  );
                })}
                
                {/* Fallback for other categories */}
                {(() => {
                  const others = filteredProducts.filter(p => !["Wall Clock", "Alarm Clock", "Hand Watch", "Photo Frame"].includes(p.category || ""));
                  if (others.length === 0) return null;
                  return (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom duration-1000">
                      <div className="flex items-center gap-8">
                        <div className="flex flex-col">
                          <h3 className="text-4xl font-headline font-bold text-primary">Other Collections</h3>
                          <div className="h-1.5 w-20 bg-accent mt-2 rounded-full" />
                        </div>
                        <div className="h-px flex-1 bg-primary/10" />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-10">
                        {others.map((clock) => (
                          <ClockCard key={clock.id} clock={clock} />
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-10">
                {filteredProducts.map((clock) => (
                  <ClockCard key={clock.id} clock={clock} />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-40 bg-muted/20 rounded-[4rem] border-4 border-dashed border-muted">
              <h3 className="text-4xl font-headline font-bold text-primary">No results found</h3>
              <p className="text-muted-foreground mt-4 text-lg max-w-lg mx-auto">Try adjusting your filters to discover our artisanal pieces.</p>
            </div>
          )}
        </section>

        {/* Showroom & Map Section */}
        <section className="py-32 bg-primary text-primary-foreground">
          <div className="wide-container">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-20 items-center">
              <div className="lg:col-span-2 space-y-12">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/20 text-accent text-[12px] font-bold uppercase tracking-widest border border-accent/20">
                    <MapPin className="h-4 w-4" /> Visit Showroom
                  </div>
                  <h2 className="v-section-heading leading-tight">Artisanal Studio</h2>
                  <p className="text-xl text-primary-foreground/70 leading-relaxed font-body">
                    Step into our Morbi studio to experience the tactile warmth of natural wood and the silent precision of our movements.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-8">
                  <div className="flex items-start gap-6 p-8 rounded-[2.5rem] bg-white/5 border border-white/10 group hover:bg-white/10 transition-colors shadow-2xl">
                    <div className="w-16 h-16 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center shrink-0 shadow-lg">
                      <MapPin className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-accent uppercase tracking-widest mb-1">Our Location</p>
                      <p className="text-xl font-medium lowercase leading-relaxed">{storeSettings.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6 p-8 rounded-[2.5rem] bg-white/5 border border-white/10 group hover:bg-white/10 transition-colors shadow-2xl">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 text-accent flex items-center justify-center shrink-0 border border-white/10">
                      <ClockIcon className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-accent uppercase tracking-widest mb-1">Studio Hours</p>
                      <p className="text-xl font-medium leading-relaxed">{storeSettings.openingHours}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6 p-8 rounded-[2.5rem] bg-accent/10 border border-accent/20 group transition-all shadow-2xl relative overflow-hidden">
                    <div className="w-16 h-16 rounded-2xl bg-white text-accent flex items-center justify-center shrink-0 shadow-lg relative z-10">
                      <Zap className="h-8 w-8" />
                    </div>
                    <div className="relative z-10">
                      <p className="text-xs font-bold text-accent uppercase tracking-widest mb-1">Live Status</p>
                      {mounted && (
                        <p className={cn(
                          "text-3xl font-headline font-bold tracking-widest",
                          (() => {
                            const now = new Date();
                            const day = now.getDay();
                            const hour = now.getHours();
                            const isWednesday = day === 3;
                            const isWorkingHours = hour >= 8 && hour < 18;
                            const isOpen = isWorkingHours && !isWednesday;
                            return isOpen ? "text-green-400" : "text-red-400";
                          })()
                        )}>
                          {(() => {
                            const now = new Date();
                            const day = now.getDay();
                            const hour = now.getHours();
                            const isWednesday = day === 3;
                            const isWorkingHours = hour >= 8 && hour < 18;
                            return (isWorkingHours && !isWednesday) ? "Showroom Open" : "Showroom Closed";
                          })()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Button asChild size="lg" className="w-full sm:w-auto h-16 px-12 rounded-2xl text-lg font-bold bg-accent hover:bg-accent/90 text-accent-foreground shadow-2xl">
                  <a href={storeSettings.locationUrl} target="_blank" rel="noopener noreferrer">
                    Get Directions
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              </div>

              {/* Interactive Google Map */}
              <div className="lg:col-span-3 h-[600px] md:h-[800px] rounded-[4rem] overflow-hidden border-8 border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative">
                <iframe 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, filter: 'grayscale(0.1) contrast(1.1) brightness(0.9)' }} 
                  loading="lazy" 
                  allowFullScreen 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Store Location Map"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(storeSettings.address)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                ></iframe>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background border-t">
        <div className="wide-container py-24">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-20">
            <div className="md:col-span-4 space-y-10">
              <Link href="/" className="inline-block">
                <div className="relative h-20 w-60">
                  <Image src={storeSettings.logoUrl} alt={storeSettings.name} fill className="object-contain" />
                </div>
              </Link>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-sm">
                V-WOOD QUARTZ is dedicated to the philosophy of timelessness. We create functional art that honors the legacy of craftsmanship.
              </p>
              <div className="flex items-center gap-6">
                <a href="https://www.instagram.com/vwoodquartz?igsh=a3hrdDcyaGxtZjVr" target="_blank" rel="noopener noreferrer" className="h-12 w-12 rounded-full border-2 flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-white hover:border-accent transition-all">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://www.facebook.com/share/1CC2E5JPpU/" target="_blank" rel="noopener noreferrer" className="h-12 w-12 rounded-full border-2 flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-white hover:border-accent transition-all">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="https://whatsapp.com/channel/0029Va5RBecHFxOz9t2LtO31" target="_blank" rel="noopener noreferrer" className="h-12 w-12 rounded-full border-2 flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-white hover:border-accent transition-all">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z m3.521-11.382C18.335 0.334 15.222 0 12.003 0 5.378 0 0.003 5.378 0.003 12.003c0 2.125 0.55 4.194 1.594 6.01L0 24l6.132-1.61c1.745 0.95 3.738 1.45 5.864 1.45 6.622 0 11.997-5.375 11.997-12c0-3.21 -1.248-6.223-3.504-8.47z m-3.521 16.51c-1.528 0.82-3.218 1.254-4.881 1.254-5.514 0-10.002-4.488-10.002-10.002 0-1.74 0.45-3.447 1.3-4.948l.142-.234-.863-3.153 3.235.849 .228-.135c1.458-.865 3.125-1.322 4.887-1.322 5.513 0 10.002 4.488 10.002 10.002 0 2.673-1.04 5.186-2.924 7.07l-.234 .142z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="md:col-span-2 space-y-8">
              <h4 className="font-headline text-2xl font-bold text-primary">Discover</h4>
              <ul className="space-y-5 text-sm font-bold uppercase tracking-widest">
                <li><Link href="/" className="text-muted-foreground hover:text-accent transition-colors">Catalog</Link></li>
                {userName !== "Guest" && (
                  <li><Link href="/orders" className="text-muted-foreground hover:text-accent transition-colors">Order History</Link></li>
                )}
                <li><Link href="/about" className="text-muted-foreground hover:text-accent transition-colors">Our Story</Link></li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-8">
              <h4 className="font-headline text-2xl font-bold text-primary">Contact</h4>
              <ul className="space-y-6 text-sm">
                <li className="flex gap-4 text-muted-foreground font-bold group">
                  <Phone className="h-5 w-5 shrink-0 text-accent group-hover:scale-110 transition-transform" />
                  <a href={`tel:${storeSettings.phone}`} className="hover:text-accent transition-colors">
                    {storeSettings.phone}
                  </a>
                </li>
                <li className="flex gap-4 text-muted-foreground group">
                  <MapPin className="h-5 w-5 shrink-0 text-accent group-hover:scale-110 transition-transform" />
                  <a href={storeSettings.locationUrl} target="_blank" rel="noopener noreferrer" className="font-medium lowercase leading-relaxed hover:text-accent transition-colors">
                    {storeSettings.address}
                  </a>
                </li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-8">
              <h4 className="font-headline text-2xl font-bold text-primary">Join the Collection</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Stay updated on our latest artisanal drops and special events.
              </p>
              <div className="flex gap-2">
                <Input placeholder="your@email.com" className="h-14 rounded-2xl bg-muted/50 border-none px-6" />
                <Button variant="default" className="h-14 w-14 rounded-2xl bg-primary">
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-24 pt-12 border-t flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.3em]">
              © {mounted ? new Date().getFullYear() : '2024'} {storeSettings.name} • Crafted in Morbi, Gujarat
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center font-bold uppercase tracking-[0.3em] text-accent">Curating Timepieces...</div>}>
      <HomeContent />
    </Suspense>
  );
}
