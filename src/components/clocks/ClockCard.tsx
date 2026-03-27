"use client";

import Link from "next/link";
import { Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Clock } from "@/app/lib/types";
import { useStore } from "@/app/lib/store";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export function ClockCard({ clock }: { clock: Clock }) {
  const { addToCart } = useStore();
  const isOutOfStock = clock.stock <= 0;
  
  // High-end discount detection
  const discountPrice = (clock as any).discountPrice;
  const hasDiscount = discountPrice && discountPrice < clock.price;
  const discountPercent = hasDiscount ? Math.round(((clock.price - discountPrice) / clock.price) * 100) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    addToCart(clock);
    toast({
      title: "Added to Cart",
      description: `${clock.name} has been added to your shopping cart.`,
    });
  };

  return (
    <Card className="v-card group relative">
      {isOutOfStock && (
        <div className="absolute inset-0 z-30 bg-white/70 backdrop-blur-[4px] flex items-center justify-center">
          <Badge variant="destructive" className="text-xs font-bold px-6 py-2 rounded-full uppercase tracking-[0.2em] shadow-2xl">
            Sold Out
          </Badge>
        </div>
      )}
      
      {hasDiscount && !isOutOfStock && (
        <div className="absolute top-5 right-5 z-20 animate-in fade-in zoom-in duration-500">
          <Badge className="bg-accent text-accent-foreground font-bold px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-1.5 border-none">
            <Tag className="h-3 w-3" />
            {discountPercent}% Artisanal Offer
          </Badge>
        </div>
      )}

      <Link href={`/product/${clock.id}`} className={isOutOfStock ? "pointer-events-none" : ""}>
        <div className="relative aspect-square bg-black overflow-hidden flex items-center justify-center p-8 border-[8px] border-primary shadow-2xl transition-all duration-500 group-hover:scale-[0.98] group-hover:border-accent">
          <img
            src={clock.imageUrl}
            alt={clock.name}
            className={`w-full h-full object-contain transition-transform duration-700 ${isOutOfStock ? 'grayscale opacity-30 shadow-none' : 'group-hover:scale-110 drop-shadow-[0_20px_40px_rgba(255,255,255,0.05)]'}`}
          />
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-6 left-6">
            <span className="bg-primary/90 text-white px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.3em] rounded-full backdrop-blur-md shadow-2xl border border-white/10">
              {clock.style}
            </span>
          </div>
        </div>
        <CardContent className="p-8">
          <h3 className="font-headline text-2xl font-bold text-primary line-clamp-1 mb-2">{clock.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed min-h-[48px]">
            {clock.description}
          </p>
        </CardContent>
      </Link>
      <CardFooter className="p-8 pt-0 flex items-center justify-between">
        <div className="flex flex-col">
          {hasDiscount ? (
            <>
              <span className="text-2xl font-bold text-accent">₹{discountPrice.toLocaleString('en-IN')}</span>
              <span className="text-xs font-bold text-muted-foreground/50 line-through">₹{clock.price.toLocaleString('en-IN')}</span>
            </>
          ) : (
            <span className="text-2xl font-bold text-primary">₹{clock.price.toLocaleString('en-IN')}</span>
          )}
        </div>
        <Button 
          size="lg" 
          variant={isOutOfStock ? "outline" : "secondary"} 
          className="rounded-2xl h-14 w-14 p-0 shadow-lg transition-all hover:scale-110 active:scale-90"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </CardFooter>
    </Card>
  );
}