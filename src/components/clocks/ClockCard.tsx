"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Plus, Tag, Truck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Clock } from "@/app/lib/types";
import { useStore } from "@/app/lib/store";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ClockCard({ clock }: { clock: Clock }) {
  const { addToCart, toggleFavorite, isFavorite, addRating, getAverageRating, getProductRatings, getUserRating, userName, userPhoto } = useStore();
  const [hoverRating, setHoverRating] = useState(0);
  const avgRating = getAverageRating(clock.id);
  const totalRatings = getProductRatings(clock.id).length;
  const isFav = isFavorite(clock.id);
  // Previously submitted rating by the current user (if any)
  const userExistingRating = getUserRating(clock.id);
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
  
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleFavorite(clock);
    toast({
      title: isFav ? "Removed from Favorites" : "Added to Favorites",
      description: `${clock.name} has been ${isFav ? "removed from" : "added to"} your favorites.`,
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
      
      <div className="absolute top-5 right-5 z-40 flex flex-col items-end gap-3 pointer-events-auto">
        <Button 
          variant="ghost" 
          size="icon" 
          className={`h-12 w-12 rounded-full backdrop-blur-xl border-2 transition-all duration-300 hover:scale-110 active:scale-95 ${
            isFav 
              ? "bg-red-500/10 border-red-500/20 text-red-500 fill-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]" 
              : "bg-white/10 border-white/20 text-white hover:bg-white/20"
          }`}
          onClick={handleToggleFavorite}
        >
          <Heart className={`h-6 w-6 transition-transform duration-500 ${isFav ? "scale-110" : "scale-100"}`} />
        </Button>
        
        {hasDiscount && !isOutOfStock && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <Badge className="bg-accent text-accent-foreground font-bold px-4 py-2 rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2 border-none backdrop-blur-md">
              <Tag className="h-3 w-3" />
              {discountPercent}% OFF
            </Badge>
          </div>
        )}
      </div>

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
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-headline text-2xl font-bold text-primary line-clamp-1">{clock.name}</h3>
            <div className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-lg">
              <Star className="h-3 w-3 fill-accent text-accent" />
              <span className="text-[10px] font-bold text-accent">{avgRating || "0.0"}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1 mb-4" onClick={(e) => e.preventDefault()}>
            {userExistingRating && (
              <span className="text-[9px] font-bold text-accent uppercase tracking-widest">
                Your Rating: {userExistingRating.rating} ★ — click to update
              </span>
            )}
            <div className="flex items-center gap-1 group/stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const isUpdate = !!userExistingRating;
                    addRating({
                      productId: clock.id,
                      userName: userName,
                      userPhoto: userPhoto,
                      rating: star
                    });
                    toast({
                      title: isUpdate ? "Rating Updated" : "Rating Submitted",
                      description: `You rated ${clock.name} ${star} star${star > 1 ? 's' : ''}.`,
                    });
                  }}
                  className="transition-transform active:scale-90"
                >
                  <Star
                    className={cn(
                      "h-4 w-4 transition-colors",
                      (hoverRating
                        ? hoverRating >= star
                        : (userExistingRating ? userExistingRating.rating >= star : avgRating >= star)
                      ) ? "fill-accent text-accent" : "text-muted-foreground/30"
                    )}
                  />
                </button>
              ))}
              <span className="text-[10px] text-muted-foreground ml-2">({totalRatings})</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed min-h-[48px] mb-4">
            {clock.description}
          </p>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-accent/5 border border-accent/20 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="h-10 w-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-lg shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Guaranteed Delivery</p>
              <p className="text-sm font-bold text-primary leading-none">
                {new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { 
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short'
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Link>
      <CardFooter className="p-8 pt-0 flex items-center justify-between">
        <div className="flex flex-col">
          {hasDiscount ? (
            <>
              <span className="text-2xl font-bold text-accent">Rs. {discountPrice.toLocaleString('en-IN')}/-</span>
              <span className="text-xs font-bold text-muted-foreground/50 line-through">Rs. {clock.price.toLocaleString('en-IN')}/-</span>
            </>
          ) : (
            <span className="text-2xl font-bold text-primary">Rs. {clock.price.toLocaleString('en-IN')}/-</span>
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
