"use client";

import { use } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useStore } from "@/app/lib/store";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft, CheckCircle2, ShieldCheck, Truck, Zap, AlertCircle, Box } from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { products, addToCart } = useStore();
  const router = useRouter();
  const clock = products.find(p => p.id === id);

  if (!clock) return <div className="p-20 text-center">Product not found</div>;

  const isOutOfStock = clock.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(clock);
    toast({
      title: "Added to Cart",
      description: `${clock.name} has been added to your shopping cart.`,
    });
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(clock);
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 md:py-16">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-accent mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Collection
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-lg border">
              <img 
                src={clock.imageUrl} 
                alt={clock.name} 
                className={`w-full h-full object-cover ${isOutOfStock ? 'grayscale opacity-70' : ''}`} 
              />
              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-sm">
                  <Badge variant="destructive" className="text-2xl font-bold px-8 py-4 rounded-full uppercase tracking-widest shadow-2xl">
                    Out of Stock
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest">
                  {clock.style}
                </span>
                {isOutOfStock ? (
                  <Badge variant="destructive" className="flex items-center gap-1 font-bold">
                    <AlertCircle className="h-3 w-3" />
                    Currently Unavailable
                  </Badge>
                ) : (
                  <Badge variant={clock.stock < 5 ? "secondary" : "outline"} className="flex items-center gap-1 font-bold">
                    <Box className="h-3 w-3" />
                    {clock.stock} In Stock
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">{clock.name}</h1>
              <p className="text-2xl font-bold text-accent">₹{clock.price.toLocaleString('en-IN')}</p>
            </div>

            <div className="prose prose-blue mb-8">
              <p className="text-lg text-muted-foreground leading-relaxed">
                {clock.description}
              </p>
            </div>

            <div className="space-y-6 mb-10">
              <h3 className="font-headline text-xl font-bold text-primary border-b pb-2">Specifications</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
                {clock.specifications.map((spec, i) => (
                  <li key={i} className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-accent mr-2 shrink-0" />
                    {spec}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="flex-1 h-14 text-lg font-bold border-primary text-primary hover:bg-primary/5" 
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </Button>
                <Button 
                  size="lg" 
                  className="flex-1 h-14 text-lg font-bold bg-accent hover:bg-accent/90 text-accent-foreground shadow-xl shadow-accent/20" 
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                >
                  <Zap className="mr-2 h-5 w-5" />
                  {isOutOfStock ? "Notify Me" : "Buy Now"}
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white border">
                  <Truck className="h-6 w-6 text-accent" />
                  <div>
                    <p className="text-xs font-bold text-primary uppercase">Free Shipping</p>
                    <p className="text-[10px] text-muted-foreground">On all orders</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white border">
                  <ShieldCheck className="h-6 w-6 text-accent" />
                  <div>
                    <p className="text-xs font-bold text-primary uppercase">2 Year Warranty</p>
                    <p className="text-[10px] text-muted-foreground">Certified guarantee</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
