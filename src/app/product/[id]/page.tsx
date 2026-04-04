"use client";

import { use } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useStore } from "@/app/lib/store";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft, CheckCircle2, ShieldCheck, Truck, Zap, AlertCircle, Box, Star, Share2, Copy, Check, X } from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { products, addToCart, userName, getAverageRating, getProductRatings } = useStore();
  const router = useRouter();
  const clock = products.find(p => p.id === id);
  const avgRating = clock ? getAverageRating(clock.id) : 0;
  const totalRatings = clock ? getProductRatings(clock.id).length : 0;

  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [productUrl, setProductUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setProductUrl(`${window.location.origin}/product/${id}`);
    }
  }, [id]);

  if (!clock) return <div className="p-20 text-center">Product not found</div>;

  const isOutOfStock = clock.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    if (userName === "Guest") {
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please sign in to add items to your cart.",
      });
      router.push("/login");
      return;
    }
    addToCart(clock);
    toast({
      title: "Added to Cart",
      description: `${clock.name} has been added to your shopping cart.`,
    });
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    if (userName === "Guest") {
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please sign in to purchase this product.",
      });
      router.push("/login");
      return;
    }
    addToCart(clock);
    router.push("/checkout");
  };

  const shareMessage = `Check out this amazing product: ${clock.name}\n${productUrl}`;

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, "_blank");
    setShowShareModal(false);
  };

  const handleFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}&quote=${encodeURIComponent(`Check out: ${clock.name}`)}`, "_blank");
    setShowShareModal(false);
  };

  const handleEmail = () => {
    window.open(`mailto:?subject=${encodeURIComponent(`Check out: ${clock.name}`)}&body=${encodeURIComponent(shareMessage)}`, "_blank");
    setShowShareModal(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      toast({ title: "Link Copied!", description: "Product link copied to clipboard." });
    } catch {
      toast({ variant: "destructive", title: "Copy Failed", description: "Could not copy the link." });
    }
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
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
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
                {/* Share Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-5 rounded-full border-primary/20 text-primary font-bold hover:border-accent hover:text-accent hover:bg-accent/5 transition-all gap-2"
                  onClick={() => setShowShareModal(true)}
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">{clock.name}</h1>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={require('@/lib/utils').cn("h-4 w-4", s <= avgRating ? "fill-accent text-accent" : "text-muted-foreground/30")} />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-primary">{avgRating}</span>
                  <span className="text-sm text-muted-foreground ml-1">({totalRatings} reviews)</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-accent">Rs. {clock.price.toLocaleString('en-IN')}/-</p>
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
              
              <div className="space-y-4">
                <div className="bg-accent/5 border-2 border-accent/20 rounded-[2.5rem] p-8 shadow-sm group transition-all hover:border-accent hover:shadow-xl">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="h-16 w-16 rounded-[1.5rem] bg-accent text-accent-foreground flex items-center justify-center shrink-0 shadow-2xl group-hover:scale-110 transition-transform">
                      <Truck className="h-8 w-8" />
                    </div>
                    <div className="text-center md:text-left space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em]">Guaranteed Artisanal Delivery</p>
                      <h4 className="text-2xl font-headline font-bold text-primary">
                        {new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { 
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </h4>
                      <p className="text-xs font-bold text-accent uppercase tracking-widest">Hand-Packed &amp; Dispatched from Morbi</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-primary/10 shadow-sm">
                    <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Guarantee</p>
                      <p className="text-sm font-bold text-primary">2 Year Warranty</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-primary/10 shadow-sm">
                    <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                      <Box className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Shipping</p>
                      <p className="text-sm font-bold text-primary">Free Worldwide</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 animate-in slide-in-from-bottom-4 duration-300">
            {/* Close */}
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-6 right-6 h-9 w-9 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-1">
                <div className="h-10 w-10 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Share2 className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-headline font-bold text-primary">Share Product</h2>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Choose a platform</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3 bg-muted/30 p-3 rounded-xl font-mono truncate">{productUrl}</p>
            </div>

            {/* Share Options */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* WhatsApp */}
              <button
                onClick={handleWhatsApp}
                className="group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-green-100 bg-green-50 hover:border-green-400 hover:bg-green-100 transition-all hover:scale-[1.03] active:scale-95"
              >
                <div className="h-12 w-12 rounded-2xl bg-[#25D366] flex items-center justify-center shadow-lg shadow-green-200 group-hover:scale-110 transition-transform">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.848L0 24l6.335-1.652A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-4.964-1.348l-.356-.212-3.761.981.999-3.662-.232-.376A9.785 9.785 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z"/>
                  </svg>
                </div>
                <span className="text-sm font-bold text-green-700">WhatsApp</span>
              </button>

              {/* Facebook */}
              <button
                onClick={handleFacebook}
                className="group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-blue-100 bg-blue-50 hover:border-blue-400 hover:bg-blue-100 transition-all hover:scale-[1.03] active:scale-95"
              >
                <div className="h-12 w-12 rounded-2xl bg-[#1877F2] flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span className="text-sm font-bold text-blue-700">Facebook</span>
              </button>

              {/* Email */}
              <button
                onClick={handleEmail}
                className="group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-orange-100 bg-orange-50 hover:border-orange-400 hover:bg-orange-100 transition-all hover:scale-[1.03] active:scale-95"
              >
                <div className="h-12 w-12 rounded-2xl bg-[#EA4335] flex items-center justify-center shadow-lg shadow-orange-200 group-hover:scale-110 transition-transform">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </div>
                <span className="text-sm font-bold text-orange-700">Email</span>
              </button>

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-purple-100 bg-purple-50 hover:border-purple-400 hover:bg-purple-100 transition-all hover:scale-[1.03] active:scale-95"
              >
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all ${copied ? 'bg-green-500 shadow-green-200' : 'bg-[#7C3AED] shadow-purple-200'}`}>
                  {copied ? <Check className="h-6 w-6 text-white" /> : <Copy className="h-6 w-6 text-white" />}
                </div>
                <span className={`text-sm font-bold ${copied ? 'text-green-700' : 'text-purple-700'}`}>
                  {copied ? "Copied!" : "Copy Link"}
                </span>
              </button>
            </div>

            {/* Product preview strip */}
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-primary/5">
              <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0 bg-white border shadow-sm">
                <img src={clock.imageUrl} alt={clock.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-primary text-sm truncate">{clock.name}</p>
                <p className="text-[10px] text-accent font-bold uppercase tracking-widest">Rs. {clock.price.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
