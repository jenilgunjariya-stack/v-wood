"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useStore } from "@/app/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Edit, Save, LogOut, Settings, ShieldCheck, ShoppingBag, Calendar, Package, Clock, Truck, CheckCircle2, PackageCheck, ChevronRight, CalendarCheck, FileText, Mail, MapPin, ImageIcon, Camera, Upload, Trash2, ShieldAlert, Heart, X, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

export default function ProfilePage() {
  const { userName, userEmail, userPhoto, userAddress, userBankName, isAdmin, isDelivery, setUserName, setUserEmail, setUserPhoto, setUserAddress, setUserBankName, orders, favorites, storeSettings, logout, cancelOrder } = useStore();
  const [nameInput, setNameInput] = useState(userName);
  const [emailInput, setEmailInput] = useState(userEmail);
  const [photoInput, setPhotoInput] = useState(userPhoto);
  const [addressInput, setAddressInput] = useState(userAddress);
  const [bankNameInput, setBankNameInput] = useState(userBankName);
  const [mounted, setMounted] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    setNameInput(userName);
    setEmailInput(userEmail);
    setPhotoInput(userPhoto);
    setAddressInput(userAddress);
    setBankNameInput(userBankName);
  }, [userName, userEmail, userPhoto, userAddress, userBankName]);

  const userOrders = orders.filter(o => o.userName === userName && userName !== "Guest");
  const lastOrder = userOrders.length > 0 ? userOrders[0] : null;

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Geolocation not supported",
        description: "Your browser does not support location services.",
      });
      return;
    }

    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          
          if (data && data.address) {
            const addr = data.address;
            const fullAddress = data.display_name;

            setAddressInput(fullAddress);

            toast({
              title: "Location detected",
              description: `Successfully fetched address for ${addr.city || 'your area'}.`,
            });
          }
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Location error",
            description: "Failed to fetch address details. Please enter manually.",
          });
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (error) => {
        setIsFetchingLocation(false);
        toast({
          variant: "destructive",
          title: "Permission denied",
          description: "Please enable location access in your browser settings.",
        });
      }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB Limit
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please choose an image under 10MB.",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPhotoInput(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!nameInput.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid Name",
        description: "Please enter a valid display name.",
      });
      return;
    }
    setUserName(nameInput);
    // Email is the login identity — not editable from profile
    setUserPhoto(photoInput);
    setUserAddress(addressInput);
    setUserBankName(bankNameInput);
    toast({
      title: "Profile Updated",
      description: "Your information has been saved successfully.",
    });
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'Processing': return 25;
      case 'Shipped': return 50;
      case 'Out for Delivery': return 75;
      case 'Delivered': return 100;
      case 'Cancelled': return 0;
      default: return 0;
    }
  };

  const getExpectedDate = (dateStr: string) => {
    if (!mounted) return "...";
    try {
      const datePart = dateStr.split(' at ')[0];
      const orderDate = new Date(datePart);
      const estimate = new Date(orderDate);
      estimate.setDate(estimate.getDate() + 4);
      return estimate.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return "TBD";
    }
  };

  const getDaysToGo = (dateStr: string, status: string) => {
    if (!mounted) return "...";
    if (status === 'Delivered') return "Arrived";

    try {
      const datePart = dateStr.split(' at ')[0];
      const orderDate = new Date(datePart);
      const estimate = new Date(orderDate);
      estimate.setDate(estimate.getDate() + 4);

      const now = new Date();
      const diffTime = estimate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) return "Arriving soon";
      return `${diffDays} days to go`;
    } catch (e) {
      return "3-4 days to go";
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 md:py-24 max-w-5xl">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-16 text-center md:text-left">
          <div className="relative group">
            <div className="relative w-32 h-32 rounded-full bg-primary text-primary-foreground shadow-2xl border-4 border-white overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105">
              {photoInput ? (
                <img src={photoInput} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <User className="h-16 w-16" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-10 h-10 bg-accent text-accent-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-accent/90 transition-colors border-4 border-white"
            >
              <Camera className="h-5 w-5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          <div>
             <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2 line-clamp-1">Welcome, {userName}</h1>
             <p className="text-muted-foreground text-lg">{userEmail || "Artist & Collector • Manage your artisanal collection and track your orders."}</p>
             <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6">
                {isAdmin && (
                  <Badge className="bg-red-500 text-white border-none px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-red-500/20">
                     <ShieldAlert className="h-3 w-3" /> Studio Administrator
                  </Badge>
                )}
                {isDelivery && (
                  <Badge className="bg-accent text-white border-none px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-accent/20 transition-all">
                     <Truck className="h-3 w-3" /> Logistics Partner
                  </Badge>
                )}
                {(!isAdmin && !isDelivery) && (
                  <Badge className="bg-primary/5 text-primary border-primary/10 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest gap-2">
                     <User className="h-3 w-3" /> Verified Collector
                  </Badge>
                )}
                <div className="h-4 w-px bg-muted mx-2 hidden sm:block" />
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                   <Clock className="h-3 w-3 text-accent" /> Est. {new Date().getFullYear()}
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {/* Account Settings Section */}
            <section className="space-y-6">
              <h2 className="text-2xl font-headline font-bold text-primary flex items-center gap-3">
                <Settings className="h-6 w-6 text-accent" />
                Profile Settings
              </h2>
              <Card className="border-none shadow-2xl overflow-hidden bg-white ring-1 ring-black/5">
                <CardContent className="p-8 sm:p-10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="displayName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Display Name
                      </Label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                        <Input
                          id="displayName"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          placeholder="Your full name"
                          className="pl-12 h-14 text-lg rounded-xl border-2 focus:border-accent transition-all bg-muted/10"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          Email Address
                        </Label>
                        <span className="text-[9px] font-bold text-accent uppercase tracking-widest flex items-center gap-1 bg-accent/10 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="h-3 w-3" /> Login Identity
                        </span>
                      </div>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={emailInput}
                          readOnly
                          className="pl-12 h-14 text-lg rounded-xl border-2 bg-muted/30 text-muted-foreground cursor-not-allowed select-all"
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground ml-1">
                        This is your login email and cannot be changed here.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      Profile Picture
                    </Label>
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-14 flex-1 w-full rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-accent hover:bg-accent/5 gap-3 transition-all"
                      >
                        <Upload className="h-5 w-5 text-accent" />
                        <span className="font-bold">Choose from Device</span>
                      </Button>
                      {photoInput && (
                        <Button
                          variant="ghost"
                          onClick={() => setPhotoInput("")}
                          className="h-14 px-6 text-destructive hover:bg-destructive/10 rounded-xl"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground italic ml-1 mt-2">
                      Accepted formats: JPG, PNG. Max size 10MB.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="address" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Shipping Address
                      </Label>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-3 text-accent hover:text-accent/80 font-bold text-[10px] uppercase tracking-widest gap-2 bg-accent/5 rounded-full"
                        onClick={fetchLocation}
                        disabled={isFetchingLocation}
                      >
                        {isFetchingLocation ? <Loader2 className="h-3 w-3 animate-spin" /> : <MapPin className="h-3 w-3" />}
                        Use Current Location
                      </Button>
                    </div>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-6 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                      <Textarea
                        id="address"
                        value={addressInput}
                        onChange={(e) => setAddressInput(e.target.value)}
                        placeholder="House No, Street, City, ZIP Code"
                        className="pl-12 min-h-[120px] text-lg rounded-xl border-2 focus:border-accent transition-all bg-muted/10"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="bankName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Linked Bank Name (for GPay/UPI)
                    </Label>
                    <div className="relative group">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                      <Input
                        id="bankName"
                        value={bankNameInput}
                        onChange={(e) => setBankNameInput(e.target.value)}
                        placeholder="e.g. State Bank of India"
                        className="pl-12 h-14 text-lg rounded-xl border-2 focus:border-accent transition-all bg-muted/10"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                      onClick={handleSave}
                      className="flex-1 h-14 text-lg font-bold bg-accent hover:bg-accent/90 text-accent-foreground rounded-2xl shadow-xl shadow-accent/20 transition-transform active:scale-95"
                    >
                      <Save className="mr-2 h-5 w-5" />
                      Update Profile
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-14 text-lg font-bold rounded-2xl border-destructive/20 text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (confirm("Are you sure you want to clear your local session? This will remove your cart and order history.")) {
                          logout();
                          localStorage.clear();
                          window.location.href = "/login";
                        }
                      }}
                    >
                      <LogOut className="mr-2 h-5 w-5" />
                      Sign Out & Clear
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Tracking Section for Latest Order - Visible only for logged in users */}
            {userName !== "Guest" && (
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-headline font-bold text-primary flex items-center gap-3">
                    <Truck className="h-6 w-6 text-accent" />
                    Active Order Tracking
                  </h2>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button asChild variant="outline" size="sm" className="rounded-full gap-2 border-primary/20 text-primary hover:bg-primary/5 font-bold uppercase tracking-widest text-[10px]">
                      <Link href="/orders">
                        <ShoppingBag className="h-4 w-4" />
                        All Orders
                      </Link>
                    </Button>
                    {lastOrder && (
                      <Button asChild variant="outline" size="sm" className="rounded-full gap-2 border-accent text-accent hover:bg-accent/10 font-bold uppercase tracking-widest text-[10px]">
                        <Link href={`/order/${lastOrder.id}/bill`}>
                          <FileText className="h-4 w-4" />
                          Latest Bill
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>

                <Card className="border-none shadow-2xl overflow-hidden bg-white ring-1 ring-black/5">
                  <CardHeader className="bg-primary text-primary-foreground p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-primary-foreground/60 mb-1">Track Order</p>
                        <CardTitle className="font-headline text-2xl">
                          {lastOrder ? lastOrder.id : "No active orders"}
                        </CardTitle>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {lastOrder && (
                          <Badge variant="secondary" className="bg-accent text-accent-foreground font-bold px-4 py-1.5 rounded-full text-sm">
                            {lastOrder.status === 'Processing' ? 'Accepted' : lastOrder.status}
                          </Badge>
                        )}
                        {lastOrder && (
                          <Button asChild size="sm" variant="outline" className="h-9 px-4 rounded-full border-accent text-accent hover:bg-accent/10 font-bold text-[10px] uppercase tracking-widest gap-2 bg-white/5 backdrop-blur-sm self-stretch sm:self-auto">
                            <Link href={`/order/${lastOrder.id}/bill`}>
                              <FileText className="h-4 w-4" />
                              Digital Bill
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 sm:p-8 lg:p-10">
                    {lastOrder ? (
                      <div className="space-y-12">
                        {/* Tracking Timeline */}
                        <div className="space-y-8">
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Current Status</p>
                              <p className={cn("text-xl font-bold flex items-center gap-2", lastOrder.status === 'Cancelled' ? "text-red-500" : "text-primary")}>
                                {lastOrder.status === 'Cancelled' && <X className="h-5 w-5" />}
                                {lastOrder.status}
                              </p>
                            </div>
                            {lastOrder.status !== 'Cancelled' && (
                              <div className="text-right">
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                                  {lastOrder.status === 'Delivered' ? 'Final Status' : 'Estimated Arrival'}
                                </p>
                                <p className="text-xl font-bold text-accent flex items-center justify-end gap-2">
                                  <Clock className="h-5 w-5" />
                                  {getDaysToGo(lastOrder.date, lastOrder.status)}
                                </p>
                              </div>
                            )}
                          </div>

                          {lastOrder.status !== 'Cancelled' && (
                            <div className="relative py-4">
                              <Progress value={getStatusProgress(lastOrder.status)} className="h-3 bg-muted rounded-full" />
                              <div className="grid grid-cols-4 justify-items-center mt-6">
                                {[
                                  { label: 'Accepted', icon: PackageCheck, threshold: 25 },
                                  { label: 'Shipped', icon: Truck, threshold: 50 },
                                  { label: 'Transit', icon: Package, threshold: 75 },
                                  { label: 'Delivered', icon: CheckCircle2, threshold: 100 }
                                ].map((step, idx) => (
                                  <div key={idx} className={cn(
                                    "flex flex-col items-center gap-2 transition-all duration-500",
                                    getStatusProgress(lastOrder.status) >= step.threshold ? "text-accent" : "text-muted-foreground/40"
                                  )}>
                                    <div className={cn(
                                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                                      getStatusProgress(lastOrder.status) >= step.threshold ? "bg-accent/10 border-accent shadow-lg shadow-accent/20" : "bg-white border-muted"
                                    )}>
                                      <step.icon className="h-5 w-5" />
                                    </div>
                                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-tighter text-center">
                                      {step.label}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Order Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-muted">
                          <div className="space-y-5">
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Shipment Details</h4>
                              <div className="space-y-4">
                                <div className="flex items-start gap-3 text-sm">
                                  <Calendar className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                                  <div>
                                    <p className="font-bold text-primary">Order Date (Accepted)</p>
                                    <p className="text-muted-foreground">{lastOrder.date}</p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-3 text-sm">
                                  <CalendarCheck className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                                  <div>
                                    <p className="font-bold text-primary">Expected Delivery Date</p>
                                    <p className="text-accent font-bold">{getExpectedDate(lastOrder.date)}</p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-3 text-sm">
                                  <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                                  <div>
                                    <p className="font-bold text-primary">Delivery Address</p>
                                    <p className="text-muted-foreground leading-relaxed">{lastOrder.customerAddress}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">Artisanal Package Contents</h4>
                            <div className="space-y-4">
                              {lastOrder.items.map((item, i) => (
                                <div key={i} className="flex items-center gap-5 bg-white/50 p-3 rounded-2xl border-2 border-primary/5 hover:border-accent/30 transition-all group">
                                  <div className="h-16 w-16 rounded-xl border-4 border-white shadow-xl overflow-hidden shrink-0 bg-muted transition-transform group-hover:scale-105">
                                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-primary truncate leading-tight mb-1">{item.name}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Qty: {item.quantity}</p>
                                  </div>
                                  <div className="text-right">
                                                                        <span className="text-xs font-bold text-accent block">RS. {(item.price * item.quantity).toLocaleString('en-IN')}/-</span>
                                    <span className="text-[9px] text-muted-foreground italic">Item Total</span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="mt-8 p-6 bg-primary/5 rounded-[2rem] border-2 border-dashed border-primary/10 flex justify-between items-center">
                              <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Verified Payment</p>
                                                                 <span className="text-2xl font-bold text-primary">RS. {lastOrder.total.toLocaleString('en-IN')}/-</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <div className="relative h-12 w-12 grayscale opacity-40">
                                  <img src={storeSettings.logoUrl} alt="V-WOOD Seal" className="w-full h-full object-contain" />
                                </div>
                                <p className="text-[7px] font-bold text-muted-foreground uppercase tracking-[0.3em] mt-1">Verified Studio Piece</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {lastOrder.status !== 'Cancelled' && (lastOrder.status === 'Confirmed' || lastOrder.status === 'Processing' || lastOrder.status === 'Awaiting Verification') && (
                          <div className="mt-8 pt-8 border-t border-dashed flex justify-end">
                             <Button 
                              variant="link" 
                              className="text-red-500 font-bold uppercase tracking-widest text-[10px] hover:text-red-700 h-8 gap-1"
                              onClick={() => {
                                if (confirm("Are you sure you want to cancel this order?")) {
                                  cancelOrder(lastOrder.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              Cancel Order
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-16 space-y-6">
                        <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                          <ShoppingBag className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                        <div className="max-w-xs mx-auto">
                          <h3 className="text-xl font-headline font-bold text-primary mb-2">Ready for your first piece?</h3>
                          <p className="text-muted-foreground text-sm mb-6">Explore our curated collection of artisanal wooden timepieces.</p>
                          <Button asChild className="w-full rounded-full h-12">
                            <Link href="/">Browse Collection</Link>
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">

            <Card className="border-none shadow-2xl overflow-hidden bg-white border-t-4 border-t-red-500">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-3 text-red-500 font-bold mb-2">
                  <Heart className="h-6 w-6 fill-red-500" />
                  <span className="uppercase tracking-widest text-xs">My Collection</span>
                </div>
                <CardTitle className="font-headline text-2xl">Your Favorites</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  You have saved {favorites.length} handcrafted timepieces to your favorites.
                </p>
                <Button asChild variant="outline" className="w-full h-12 rounded-xl border-red-500 text-red-500 hover:bg-red-50 font-bold uppercase tracking-widest text-[10px]">
                  <Link href="/favorites">
                    View Favorites
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {(isAdmin || isDelivery) && (
               <Card className="border-none shadow-2xl overflow-hidden bg-primary text-white">
                 <CardHeader className="p-8 pb-4">
                   <div className="flex items-center gap-3 text-accent font-bold mb-2">
                     <ShieldCheck className="h-6 w-6" />
                     <span className="uppercase tracking-widest text-xs">Access Granted</span>
                   </div>
                   <CardTitle className="font-headline text-2xl">Management Link</CardTitle>
                 </CardHeader>
                 <CardContent className="p-8 pt-0 space-y-6">
                   <p className="text-white/60 text-sm leading-relaxed">
                     Your verified credentials provide access to the {isAdmin ? "Studio Hub" : "Logistics Portal"}.
                   </p>
                   <Button asChild variant="outline" className="w-full h-14 rounded-2xl bg-white/10 border-white/20 text-white hover:bg-white hover:text-primary font-bold uppercase tracking-widest text-[10px] transition-all">
                     <Link href={isAdmin ? "/admin" : "/delivery"}>
                       Open Dashboard
                       <ArrowRight className="ml-2 h-4 w-4" />
                     </Link>
                   </Button>
                 </CardContent>
               </Card>
             )}
          </div>
        </div>
      </main>
    </div>
  );
}
