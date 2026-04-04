"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/app/lib/store";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Truck, MapPin, Package, User, LogOut, Smartphone, Map as MapIcon, CheckCircle2, History, ListTodo, Navigation2, Search, CreditCard, Banknote, Wallet } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Order } from "@/app/lib/types";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

export default function DeliveryPage() {
  const { orders, updateOrderStatus, userName, isDelivery, logout } = useStore();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!isDelivery) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-none shadow-2xl text-center p-10 space-y-6 rounded-[2.5rem]">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 text-red-600 mb-4 animate-bounce">
              <Truck className="h-10 w-10" />
            </div>
            <h1 className="text-3xl font-headline font-bold text-primary">Logistics Denied</h1>
            <p className="text-muted-foreground leading-relaxed">This terminal is restricted to our authorized logistics partners.</p>
            <Button onClick={() => router.push("/login")} className="w-full h-14 bg-primary text-white font-bold rounded-2xl">
              Logistics Login
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  const handleStatusChange = (orderId: string, status: Order['status']) => {
    updateOrderStatus(orderId, status);
    toast({
      title: "Logistics Updated",
      description: `Order ${orderId} is now ${status}.`
    });
  };

  const allDeliveryOrders = orders.filter(o => o.status !== 'Cancelled' && o.paymentMethod !== 'In-Shop');
  const filteredOrders = allDeliveryOrders.filter(o => {
    const idMatch = o.id?.toLowerCase().includes(searchQuery.toLowerCase());
    const nameMatch = o.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
    const addressMatch = o.customerAddress?.toLowerCase().includes(searchQuery.toLowerCase());
    return idMatch || nameMatch || addressMatch;
  });

  const activeOrders = filteredOrders.filter(o => o.status !== 'Delivered');
  const completedOrders = filteredOrders.filter(o => o.status === 'Delivered');

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-body">
      <Navbar />
      
      {/* Compact Logistics Header */}
      <div className="bg-primary text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/[0.03] rounded-full -mr-24 -mt-24 blur-3xl" />
        <div className="max-w-7xl mx-auto px-6 lg:px-20 py-8 lg:py-12 relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-3">
               <div className="inline-flex items-center gap-3 px-3 py-1 bg-accent/20 border border-accent/20 rounded-full">
                  <div className="h-2 w-2 bg-accent rounded-full animate-pulse" />
                  <span className="text-[9px] font-bold text-accent uppercase tracking-[0.2em]">Logistics Terminal node</span>
               </div>
               <h1 className="text-4xl lg:text-5xl font-headline font-bold tracking-tight">
                  Logistics <span className="text-accent underline decoration-accent/30 underline-offset-4">Portal</span>
               </h1>
               <p className="text-white/60 text-base font-medium">
                  Welcome back, <span className="text-white font-bold">{userName}</span>. Ready for artisanal fulfillment.
               </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-3 pr-6">
                 <div className="h-10 w-10 bg-accent/20 rounded-xl flex items-center justify-center">
                    <History className="h-5 w-5 text-accent" />
                 </div>
                 <div>
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Goal Status</p>
                    <p className="text-lg font-bold">{completedOrders.length} / {allDeliveryOrders.length}</p>
                 </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => { logout(); router.push("/login"); }}
                className="h-14 px-8 border-white/20 text-white hover:bg-white hover:text-primary rounded-xl font-bold transition-all text-xs uppercase tracking-widest bg-transparent"
              >
                <LogOut className="mr-3 h-4 w-4" /> End Shift
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 lg:px-20 -mt-6 pb-40">
        <Tabs defaultValue="active" className="space-y-8">
          {/* Controls Bar - Perfectly Aligned Horizon */}
          <div className="flex flex-col md:flex-row items-center justify-between bg-white p-4 lg:p-5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] gap-6 border border-primary/5">
             <TabsList className="bg-muted/50 p-1.5 h-auto rounded-xl gap-1">
                <TabsTrigger value="active" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-[10px] uppercase tracking-widest transition-all">
                   <ListTodo className="mr-2 h-3.5 w-3.5" /> Active ({activeOrders.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-[10px] uppercase tracking-widest transition-all">
                   <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Completed ({completedOrders.length})
                </TabsTrigger>
             </TabsList>

             <div className="relative w-full md:w-80 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <Input 
                  placeholder="Search Registry..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-muted/20 border-none rounded-xl text-xs font-semibold focus-visible:ring-2 focus-visible:ring-accent transition-all shadow-inner"
                />
             </div>
          </div>

          <TabsContent value="active" className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
             {activeOrders.length === 0 ? (
               <div className="p-32 text-center bg-white/50 border-4 border-dashed border-muted rounded-[3rem]">
                  <p className="text-xl font-bold text-muted-foreground italic">No active deliveries match your search protocol.</p>
               </div>
             ) : (
               activeOrders.map(order => <DeliveryCard key={order.id} order={order} onUpdate={handleStatusChange} />)
             )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
             {completedOrders.length === 0 ? (
               <div className="p-32 text-center bg-white/50 border-4 border-dashed border-muted rounded-[3rem]">
                  <p className="text-xl font-bold text-muted-foreground italic">Your completion history is currently empty for this cycle.</p>
               </div>
             ) : (
               completedOrders.map(order => <DeliveryCard key={order.id} order={order} onUpdate={handleStatusChange} isCompleted />)
             )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function DeliveryCard({ order, onUpdate, isCompleted = false }: { order: Order, onUpdate: any, isCompleted?: boolean }) {
  return (
    <Card className={cn(
      "border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] rounded-[3rem] overflow-hidden bg-white hover:shadow-[0_60px_100px_-20px_rgba(0,0,0,0.12)] transition-all duration-700 group",
      isCompleted && "opacity-80"
    )}>
      <div className="flex flex-col lg:flex-row">
        {/* Logistics Profile */}
        <div className="lg:w-[380px] p-10 lg:p-12 bg-muted/10 border-b lg:border-b-0 lg:border-r border-primary/5 space-y-10">
           <div className="flex justify-between items-start">
              <div className="space-y-2">
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em]">Acquisition Link</p>
                 <h3 className="text-3xl font-bold font-mono tracking-tighter text-primary">#{order.id}</h3>
              </div>
              <div className={cn(
                "h-4 w-4 rounded-full shadow-sm ring-4 ring-offset-4 ring-offset-white transition-all duration-1000",
                order.status === 'Processing' ? "bg-yellow-400 ring-yellow-400/20" :
                order.status === 'Shipped' ? "bg-blue-400 ring-blue-400/20" :
                order.status === 'Out for Delivery' ? "bg-accent ring-accent/20" : "bg-green-500 ring-green-500/20"
              )} />
           </div>

           <div className="space-y-6">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em]">Fulfillment Protocol</p>
              <Select 
                disabled={isCompleted}
                value={order.status} 
                onValueChange={(val) => onUpdate(order.id, val as Order['status'])}
              >
                <SelectTrigger className="h-16 rounded-2xl bg-white border-2 border-primary/5 focus:border-accent text-sm font-bold uppercase tracking-widest shadow-xl transition-all">
                   <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                   <SelectItem value="Confirmed" className="h-14 rounded-xl text-xs font-bold uppercase tracking-widest">Order Confirmed</SelectItem>
                   <SelectItem value="Awaiting Verification" className="h-14 rounded-xl text-xs font-bold uppercase tracking-widest">Pending Verification</SelectItem>
                   <SelectItem value="Processing" className="h-14 rounded-xl text-xs font-bold uppercase tracking-widest">In Warehouse</SelectItem>
                   <SelectItem value="Shipped" className="h-14 rounded-xl text-xs font-bold uppercase tracking-widest">In Transit</SelectItem>
                   <SelectItem value="Out for Delivery" className="h-14 rounded-xl text-xs font-bold uppercase tracking-widest">Out for Delivery</SelectItem>
                   <SelectItem value="Delivered" className="h-14 rounded-xl text-xs font-bold uppercase tracking-widest">Delivered & Verified</SelectItem>
                </SelectContent>
              </Select>
           </div>

           <div className="space-y-4 pt-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em]">Transaction Details</p>
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-5 bg-white rounded-[2rem] border border-primary/5 space-y-1">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Inventory</p>
                    <p className="text-lg font-bold text-primary">{order.items.reduce((acc, i) => acc + i.quantity, 0)} Pcs</p>
                 </div>
                 <div className="p-5 bg-white rounded-[2rem] border border-primary/5 space-y-1">
                    <p className="text-[9px] font-bold text-accent uppercase">Value</p>
                    <p className="text-lg font-bold text-primary tracking-tighter">Rs. {order.total.toLocaleString('en-IN')}/-</p>
                 </div>
              </div>
              <div className={cn(
                "p-5 rounded-[2rem] border transition-all flex items-center justify-between",
                order.paymentMethod === 'COD' 
                  ? "bg-green-50 border-green-200 shadow-[0_10px_30px_-5px_rgba(34,197,94,0.15)]" 
                  : "bg-white border-primary/5"
              )}>
                 <div className="space-y-1">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Payment Mode</p>
                    <div className="flex items-center gap-2">
                       {order.paymentMethod === 'COD' && <Banknote className="h-4 w-4 text-green-600" />}
                       {order.paymentMethod === 'UPI' && <Smartphone className="h-4 w-4 text-blue-600" />}
                       {order.paymentMethod === 'Card' && <CreditCard className="h-4 w-4 text-purple-600" />}
                       <p className={cn(
                         "text-sm font-bold",
                         order.paymentMethod === 'COD' ? "text-green-700" : "text-primary"
                       )}>
                         {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 
                          order.paymentMethod === 'UPI' ? 'UPI Payment' : 
                          order.paymentMethod === 'Card' ? 'Card Payment' : order.paymentMethod}
                       </p>
                    </div>
                 </div>
                 {order.paymentMethod === 'COD' && (
                   <div className="px-3 py-1 bg-green-200 text-green-800 text-[8px] font-black uppercase tracking-widest rounded-full">
                     Collect Cash
                   </div>
                 )}
              </div>
           </div>
        </div>

        {/* Collector & Destination */}
        <div className="flex-1 p-10 lg:p-14 space-y-12">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
              <div className="flex items-center gap-6">
                 <div className="h-16 w-16 bg-primary text-white rounded-[1.5rem] flex items-center justify-center shadow-xl group-hover:rotate-6 transition-transform">
                    <User className="h-8 w-8" />
                 </div>
                 <div>
                    <h4 className="text-2xl font-bold text-primary mb-1">{order.customerName}</h4>
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold">
                       <Smartphone className="h-3 w-3 text-accent" /> 
                       <a href={`tel:${order.customerPhone || ''}`} className="hover:text-primary transition-colors underline decoration-dotted underline-offset-2">
                         {order.customerPhone || 'N/A'}
                       </a>
                    </div>
                 </div>
              </div>

              <div className="flex -space-x-4">
                 {order.items?.slice(0, 3).map((item, idx) => (
                   <div key={idx} className="h-16 w-16 rounded-2xl border-4 border-white shadow-lg overflow-hidden group/thumb transition-transform hover:z-10 hover:scale-110">
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover grayscale transition-all group-hover/thumb:grayscale-0" />
                   </div>
                 ))}
                 {order.items.length > 3 && (
                   <div className="h-16 w-16 rounded-2xl border-4 border-white shadow-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">+ {order.items.length - 3}</div>
                 )}
              </div>
           </div>

           <div className="relative p-10 lg:p-14 rounded-[4rem] bg-accent/5 border-2 border-accent/10 transition-all group-hover:bg-accent/[0.08] group-hover:scale-[1.01] duration-500">
              <div className="absolute -top-8 left-14 h-16 w-16 bg-accent text-white rounded-[2rem] flex items-center justify-center shadow-2xl rotate-3 group-hover:rotate-0 transition-transform">
                 <MapPin className="h-8 w-8" />
              </div>
              <div className="space-y-8">
                 <div className="space-y-4">
                    <p className="text-[10px] font-bold text-accent uppercase tracking-[0.4em]">Official Destination Address</p>
                    <p className="text-3xl lg:text-4xl font-headline font-bold text-primary leading-[1.1] tracking-tight">
                       {order.customerAddress}
                    </p>
                 </div>
                 <div className="flex flex-wrap gap-6 pt-6">
                    <Button 
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customerAddress)}`, '_blank')}
                      className="h-16 px-10 rounded-[1.5rem] bg-primary text-white font-bold text-sm uppercase tracking-widest gap-3 shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                       <Navigation2 className="h-5 w-5 text-accent" /> Open Fleet Maps
                    </Button>
                    <Button 
                      variant="outline"
                      asChild
                      className="h-16 px-10 rounded-[1.5rem] border-2 border-primary/10 text-primary font-bold text-sm uppercase tracking-widest gap-3 bg-white hover:bg-primary hover:text-white transition-all shadow-xl inline-flex items-center justify-center cursor-pointer"
                    >
                      <a href={`tel:${(order.customerPhone || '').replace(/\D/g,'')}`}>
                        <Smartphone className="h-5 w-5" /> Collector Direct
                      </a>
                    </Button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </Card>
  );
}
