"use client";

import { useStore } from "@/app/lib/store";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Truck, Clock, CheckCircle2, ChevronDown, ChevronUp, MapPin, CreditCard, ShoppingBag, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

export default function OrdersPage() {
  const { orders, cancelOrder, userName } = useStore();
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);

  const toggleOrder = (orderId: string) => {
    setExpandedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId) 
        : [...prev, orderId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'Processing': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'Shipped': return 'bg-purple-500/10 text-purple-600 border-purple-200';
      case 'Delivered': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'Cancelled': return 'bg-red-500/10 text-red-600 border-red-200';
      case 'Awaiting Verification': return 'bg-amber-500/10 text-amber-600 border-amber-200';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-200';
    }
  };

  if (userName === "Guest") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-32 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/5 mb-8 shadow-inner animate-in zoom-in duration-500">
            <Package className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-headline font-bold text-primary mb-4">Please log in</h1>
          <p className="text-muted-foreground mb-12 max-w-md mx-auto text-lg leading-relaxed">
            You need to be logged in to view your order history and track your acquisitions.
          </p>
          <Button asChild size="lg" className="h-16 px-12 rounded-full text-lg font-bold shadow-2xl hover:scale-105 transition-all">
            <Link href="/login">Log In to Account</Link>
          </Button>
        </main>
      </div>
    );
  }

  const userOrders = orders.filter(o => o.userName === userName);
  const sortedOrders = [...userOrders].reverse(); // Show newest first

  if (userOrders.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-32 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/5 mb-8 shadow-inner animate-in zoom-in duration-500">
            <ShoppingBag className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-headline font-bold text-primary mb-4">No orders yet</h1>
          <p className="text-muted-foreground mb-12 max-w-md mx-auto text-lg leading-relaxed">
            Your collection is waiting for its first masterpiece. Start exploring our artisanal timepieces today.
          </p>
          <Button asChild size="lg" className="h-16 px-12 rounded-full text-lg font-bold shadow-2xl hover:scale-105 transition-all">
            <Link href="/">Explore Collection</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-6">
          <div>
            <Link href="/profile" className="inline-flex items-center text-sm font-bold text-accent hover:text-accent/80 mb-4 uppercase tracking-widest transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
            </Link>
            <h1 className="text-5xl font-headline font-bold text-primary tracking-tight">Order History</h1>
            <p className="text-muted-foreground mt-4 text-lg">Manage and track your artisanal acquisitions.</p>
          </div>
          <div className="flex items-center gap-4 p-6 bg-white rounded-3xl border shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Acquisitions</p>
              <p className="text-2xl font-bold text-primary">{userOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          {sortedOrders.map((order) => {
            const isExpanded = expandedOrders.includes(order.id);
            const deliveryEstimate = new Date(new Date(order.date).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
              weekday: 'long', day: 'numeric', month: 'short'
            });

            return (
              <Card key={order.id} className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.08)] rounded-[2.5rem] overflow-hidden bg-white group hover:shadow-[0_40px_100px_rgba(0,0,0,0.12)] transition-all duration-500">
                <CardHeader className="bg-primary p-8 md:p-10 text-primary-foreground relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-10 -mt-10" />
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">Reference</span>
                        <Badge variant="outline" className="border-white/20 text-white font-mono rounded-lg px-3">#{order.id}</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-accent" />
                        <span className="text-xl font-bold">{order.date}</span>
                      </div>
                      {order.paymentMethod === "In-Shop" && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent text-[9px] font-black uppercase tracking-[0.3em] border border-accent/30">
                            <ShoppingBag className="h-3 w-3" />
                            In-Shop Purchase
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none mb-1">Total Paid</p>
                                                <p className="text-3xl font-headline font-bold text-accent leading-none">RS. {order.total.toLocaleString('en-IN')}/-</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  {/* Status Bar */}
                  <div className="flex flex-col md:flex-row border-b border-primary/5">
                    <div className="flex-1 p-8 md:p-10 flex items-center gap-6 border-b md:border-b-0 md:border-r border-primary/5 group/status cursor-default transition-colors hover:bg-accent/5">
                      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${getStatusColor(order.status)}`}>
                        <CheckCircle2 className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Order Status</p>
                        <p className="text-xl font-bold text-primary">{order.status}</p>
                      </div>
                    </div>
                    {order.status !== 'Cancelled' && (
                      <div className="flex-1 p-8 md:p-10 flex items-center gap-6 group/ship cursor-default transition-colors hover:bg-accent/5">
                        <div className="h-14 w-14 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center shrink-0 shadow-lg shadow-accent/20">
                          <Truck className="h-7 w-7" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                            {order.status === 'Delivered' ? 'Arrived On' : 'Est. Arrival'}
                          </p>
                          <p className="text-xl font-bold text-primary">{deliveryEstimate}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Summary row */}
                  <div className="px-8 md:px-10 py-6 flex items-center justify-between bg-muted/20">
                    <div className="flex -space-x-4 overflow-hidden">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="relative h-12 w-12 rounded-full border-2 border-white shadow-lg overflow-hidden bg-white">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="h-12 w-12 rounded-full border-2 border-white bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold shadow-lg">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={() => toggleOrder(order.id)}
                      className="text-primary font-bold uppercase tracking-widest text-[10px] h-10 px-6 rounded-full border border-primary/10 hover:bg-white"
                    >
                      {isExpanded ? 'Hide Details' : 'View Full Details'}
                      {isExpanded ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                    </Button>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-8 md:p-10 animate-in fade-in slide-in-from-top-4 duration-500 border-t border-primary/5">
                      <div className="space-y-10">
                        <div className="space-y-6">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Items Details</p>
                          <div className="grid grid-cols-1 gap-6">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-3xl bg-white border border-primary/5 group/item hover:bg-accent/5 transition-all">
                                <div className="flex items-center gap-6">
                                  <div className="relative h-20 w-20 rounded-2xl overflow-hidden border shadow-sm group-hover/item:scale-110 transition-transform">
                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                    <Link href={`/product/${item.id}`} className="text-lg font-bold text-primary hover:text-accent transition-colors flex items-center gap-2">
                                      {item.name} <ExternalLink className="h-3 w-3" />
                                    </Link>
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">{item.style}</p>
                                    <p className="text-sm font-bold text-accent mt-2">Qty: {item.quantity}</p>
                                  </div>
                                </div>
                                <div className="mt-4 sm:mt-0 text-right">
                                                                     <p className="text-lg font-bold text-primary tracking-tight">RS. {(item.price * item.quantity).toLocaleString('en-IN')}/-</p>
                                                                     <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">RS. {item.price.toLocaleString('en-IN')}/- / unit</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-dashed">
                          <div className="space-y-6">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Acquisition Details</p>
                            <div className="space-y-6">
                              <div className="flex gap-4">
                                <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                                  <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Destination</p>
                                  <p className="text-sm font-medium leading-relaxed">{order.customerAddress}</p>
                                </div>
                              </div>
                              <div className="flex gap-4">
                                <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                                  <CreditCard className="h-5 w-5" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Method</p>
                                  <p className="text-sm font-bold text-primary uppercase tracking-tighter">{order.paymentMethod === 'UPI' ? 'UPI / GPay' : order.paymentMethod === 'Card' ? 'Secure Card' : 'Cash on Delivery'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-8 rounded-[2rem] bg-primary text-primary-foreground space-y-6 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-10 -mt-10" />
                            <div className="flex justify-between items-center text-primary-foreground/60 text-[10px] font-bold uppercase tracking-widest">
                              <span>Subtotal</span>
                                                             <span>RS. {order.total.toLocaleString('en-IN')}/-</span>
                            </div>
                            <div className="flex justify-between items-center text-primary-foreground/60 text-[10px] font-bold uppercase tracking-widest">
                              <span>Shipping</span>
                              <span className="text-accent">FREE</span>
                            </div>
                            <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                              <span className="text-xl font-headline font-bold">Total Paid</span>
                                                             <span className="text-2xl font-bold text-accent tracking-tighter">RS. {order.total.toLocaleString('en-IN')}/-</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {(order.status === 'Confirmed' || order.status === 'Processing' || order.status === 'Awaiting Verification') && (
                        <div className="mt-10 pt-10 border-t border-dashed flex justify-end">
                          <Button 
                            variant="outline" 
                            className="h-12 px-8 rounded-xl border-red-200 text-red-600 hover:bg-red-50 gap-2 font-bold uppercase tracking-widest text-[10px]"
                            onClick={() => {
                              if (confirm("Are you sure you want to cancel this order? The funds will be credited back to your original payment method within 3-5 business days.")) {
                                cancelOrder(order.id);
                              }
                            }}
                          >
                            <Package className="h-4 w-4" />
                            Cancel Order
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
