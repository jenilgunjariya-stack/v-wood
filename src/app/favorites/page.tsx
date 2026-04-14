"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useStore } from "@/app/lib/store";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { ClockCard } from "@/components/clocks/ClockCard";

export default function FavoritesPage() {
  const { favorites } = useStore();

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-32 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-50 mb-8 border-2 border-red-100 animate-pulse">
            <Heart className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-4xl font-headline font-bold text-primary mb-4">Your favorites list is empty</h1>
          <p className="text-muted-foreground mb-10 max-w-md mx-auto text-lg">Save the timepieces you love to find them easily later.</p>
          <Button asChild size="lg" className="rounded-full px-10 h-14 bg-primary text-white hover:bg-accent hover:text-white transition-all shadow-xl font-bold uppercase tracking-widest text-xs">
            <Link href="/">
              Explore Collection
              <ArrowRight className="ml-3 h-5 w-5" />
            </Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <main className="wide-container py-16">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b pb-12">
          <div>
            <div className="flex items-center gap-3 mb-4 text-red-500">
              <Heart className="h-6 w-6 fill-red-500" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] font-body">My Favorites</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-headline font-bold text-primary">Your Curated <br /><span className="text-accent underline decoration-accent/20 decoration-8 underline-offset-8">Collection</span></h1>
          </div>
          <div className="flex flex-col items-start md:items-end gap-3 text-right">
             <span className="text-4xl font-headline font-bold text-primary">{favorites.length}</span>
             <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Saved Timepieces</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {favorites.filter(p => p.stock > 0).map((product) => (
            <ClockCard key={product.id} clock={product} />
          ))}
        </div>
        
        <div className="mt-24 p-12 bg-accent/5 rounded-[40px] border border-accent/10 flex flex-col items-center text-center">
            <ShoppingBag className="h-12 w-12 text-accent mb-6 opacity-50" />
            <h2 className="text-2xl font-headline font-bold text-primary mb-4">Ready to complete your collection?</h2>
            <p className="text-muted-foreground max-w-lg mb-8">All your favorite hand-crafted timepieces are here. Add them to your cart to bring artisanal elegance to your home.</p>
            <Button asChild variant="outline" className="rounded-full px-12 h-14 border-2 border-primary text-primary font-bold uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all">
                <Link href="/">Continue Shopping</Link>
            </Button>
        </div>
      </main>
    </div>
  );
}
