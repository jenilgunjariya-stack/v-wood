"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useStore } from "@/app/lib/store";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck, LogIn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, userName } = useStore();
  const router = useRouter();
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 0; // Free shipping for all orders
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-32 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-8">
            <ShoppingBag className="h-10 w-10 text-accent" />
          </div>
          <h1 className="text-4xl font-headline font-bold text-primary mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">Looks like you haven't added any timepieces to your collection yet.</p>
          <Button asChild size="lg">
            <Link href="/">Browse Catalog</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-headline font-bold text-primary mb-12">Your Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row gap-6 p-6 bg-white rounded-2xl border shadow-sm transition-all hover:shadow-md">
                <div className="relative h-32 w-full sm:w-32 rounded-xl overflow-hidden shrink-0 border">
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-headline font-bold text-primary">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.style}</p>
                    </div>
                                        <p className="text-lg font-bold text-accent">RS. {item.price.toLocaleString('en-IN')}/-</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1 bg-muted rounded-full p-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full hover:bg-white"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full hover:bg-white"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border shadow-sm p-8 sticky top-24">
              <h2 className="text-2xl font-headline font-bold text-primary mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                                        <span>RS. {subtotal.toLocaleString('en-IN')}/-</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="text-green-600 font-bold">FREE</span>
                  </div>
                  <div className="pt-4 border-t flex justify-between text-xl font-bold text-primary">
                    <span>Total</span>
                                        <span>RS. {total.toLocaleString('en-IN')}/-</span>
                  </div>
              </div>

              <div className="mb-6 p-5 rounded-[2rem] bg-accent/5 border-2 border-accent/10 flex items-center gap-4 transition-all hover:border-accent">
                <div className="h-10 w-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center shadow-md">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Expected Arrival</p>
                  <p className="text-sm font-bold text-primary leading-none">
                    {new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { 
                      weekday: 'long',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </p>
                </div>
              </div>


              <Button
                size="lg"
                className="w-full h-14 bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
                onClick={() => router.push("/checkout")}
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <p className="text-center text-[10px] text-muted-foreground mt-4">
                Taxes calculated at checkout. Free shipping on all orders.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
