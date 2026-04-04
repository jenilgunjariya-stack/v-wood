
"use client";

import { useState, useEffect } from "react";
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

export default function Home() {
  const { products, searchQuery, setSearchQuery, storeSettings, userName, userPhoto } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
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
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section - Elevated Black Box Showcase */}
        <section className="relative min-h-screen flex items-center bg-background text-primary overflow-hidden py-16 md:py-24">
          <div className="wide-container relative z-20 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
              <div className="max-w-3xl order-2 lg:order-1 animate-in fade-in slide-in-from-left duration-1000">
                <div className="flex flex-col gap-6 mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-bold uppercase tracking-widest w-fit">
                      <Layers className="h-4 w-4" />
                      Artisanal Excellence
                    </div>
                    {mounted && userName !== "Guest" && (
                      <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/5 backdrop-blur-md border border-primary/10 text-primary text-xs font-bold animate-in fade-in slide-in-from-right duration-700 w-fit">
                        <Avatar className="h-6 w-6 border border-primary/10">
                          <AvatarImage src={userPhoto} alt={userName} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            <User className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                        <span>Welcome, {userName}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <h1 className="text-6xl md:text-8xl 2xl:text-9xl font-headline font-bold mb-10 leading-[1.1] tracking-tight">
                  Capturing <br /><span className="text-accent italic">Nature's Pulse.</span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground mb-12 font-body max-w-2xl leading-relaxed">
                  V-WOOD QUARTZ transforms raw timber into high-precision timepieces, merging heritage woodworking with modern quartz accuracy since 1986.
                </p>
                <div className="flex flex-wrap gap-6">
                  <Button asChild size="lg" className="h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-12 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 text-lg">
                    <Link href="#collection">Explore Collection</Link>
                  </Button>
                </div>
              </div>

              {/* Hero Image Section - Elegant "Small Frame" Gallery */}
              <div className="relative order-1 lg:order-2 flex items-center justify-center animate-in fade-in zoom-in duration-1000">
                <div className="relative w-full max-w-md lg:max-w-lg aspect-square bg-black rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)] border-[18px] border-primary group transition-all duration-700 hover:scale-105">
                  <img
                    src={storeSettings.heroImageUrl}
                    alt="V-WOOD QUARTZ Heritage"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&q=80&w=1800";
                    }}
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40" />
                  
                  {/* Bottom Captions */}
                  <div className="absolute bottom-8 left-8 z-30 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 text-white">
                    <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-accent mb-2">Original Frame</p>
                    <p className="text-2xl font-headline font-bold">Limited Heritage</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Background decoration */}
          <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[150px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
        </section>
        {/* Visual Category Menu */}
        <section className="py-12 bg-white/50 border-y border-primary/5">
          <div className="wide-container">
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
              <button 
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "group flex flex-col items-center gap-4 p-8 rounded-[2.5rem] transition-all duration-500 min-w-[160px] border shadow-sm hover:shadow-2xl",
                  selectedCategory === null ? "bg-black text-white border-primary" : "hover:bg-black hover:text-white bg-white border-transparent"
                )}
              >
                <div className="w-16 h-16 rounded-2xl bg-accent/10 group-hover:bg-accent flex items-center justify-center text-accent group-hover:text-accent-foreground transition-colors shadow-lg">
                  <Layers className="h-8 w-8" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em]">All Collection</span>
              </button>

              <button 
                onClick={() => setSelectedCategory("Wall Clock")}
                className={cn(
                  "group flex flex-col items-center gap-4 p-8 rounded-[2.5rem] transition-all duration-500 min-w-[160px] border shadow-sm hover:shadow-2xl",
                  selectedCategory === "Wall Clock" ? "bg-black text-white border-primary" : "hover:bg-black hover:text-white bg-white border-transparent"
                )}
              >
                <div className="w-16 h-16 rounded-2xl bg-accent/10 group-hover:bg-accent flex items-center justify-center text-accent group-hover:text-accent-foreground transition-colors shadow-lg">
                  <ClockIcon className="h-8 w-8" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Wall Clocks</span>
              </button>
              
              <button 
                onClick={() => setSelectedCategory("Alarm Clock")}
                className={cn(
                  "group flex flex-col items-center gap-4 p-8 rounded-[2.5rem] transition-all duration-500 min-w-[160px] border shadow-sm hover:shadow-2xl",
                  selectedCategory === "Alarm Clock" ? "bg-black text-white border-primary" : "hover:bg-black hover:text-white bg-white border-transparent"
                )}
              >
                <div className="w-16 h-16 rounded-2xl bg-accent/10 group-hover:bg-accent flex items-center justify-center text-accent group-hover:text-accent-foreground transition-colors shadow-lg">
                  <AlarmClock className="h-8 w-8" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Alarm Clocks</span>
              </button>

              <button 
                onClick={() => setSelectedCategory("Hand Watch")}
                className={cn(
                  "group flex flex-col items-center gap-4 p-8 rounded-[2.5rem] transition-all duration-500 min-w-[160px] border shadow-sm hover:shadow-2xl",
                  selectedCategory === "Hand Watch" ? "bg-black text-white border-primary" : "hover:bg-black hover:text-white bg-white border-transparent"
                )}
              >
                <div className="w-16 h-16 rounded-2xl bg-accent/10 group-hover:bg-accent flex items-center justify-center text-accent group-hover:text-accent-foreground transition-colors shadow-lg">
                  <Watch className="h-8 w-8" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Hand Watches</span>
              </button>

              <button 
                onClick={() => setSelectedCategory("Photo Frame")}
                className={cn(
                  "group flex flex-col items-center gap-4 p-8 rounded-[2.5rem] transition-all duration-500 min-w-[160px] border shadow-sm hover:shadow-2xl",
                  selectedCategory === "Photo Frame" ? "bg-black text-white border-primary" : "hover:bg-black hover:text-white bg-white border-transparent"
                )}
              >
                <div className="w-16 h-16 rounded-2xl bg-accent/10 group-hover:bg-accent flex items-center justify-center text-accent group-hover:text-accent-foreground transition-colors shadow-lg">
                  <ImageIcon className="h-8 w-8" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Photo Frames</span>
              </button>
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-10">
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-10">
                        {others.map((clock) => (
                          <ClockCard key={clock.id} clock={clock} />
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-10">
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
                <a href="#" className="h-12 w-12 rounded-full border-2 flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-white hover:border-accent transition-all">
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div className="md:col-span-2 space-y-8">
              <h4 className="font-headline text-2xl font-bold text-primary">Discover</h4>
              <ul className="space-y-5 text-sm font-bold uppercase tracking-widest">
                <li><Link href="/" className="text-muted-foreground hover:text-accent transition-colors">Catalog</Link></li>
                <li><Link href="/orders" className="text-muted-foreground hover:text-accent transition-colors">Order History</Link></li>
                <li><Link href="/about" className="text-muted-foreground hover:text-accent transition-colors">Our Story</Link></li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-8">
              <h4 className="font-headline text-2xl font-bold text-primary">Contact</h4>
              <ul className="space-y-6 text-sm">
                <li className="flex gap-4 text-muted-foreground font-bold">
                  <Phone className="h-5 w-5 shrink-0 text-accent" />
                  <span>{storeSettings.phone}</span>
                </li>
                <li className="flex gap-4 text-muted-foreground">
                  <MapPin className="h-5 w-5 shrink-0 text-accent" />
                  <span className="font-medium lowercase leading-relaxed">{storeSettings.address}</span>
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
