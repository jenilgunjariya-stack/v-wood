"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useStore } from "@/app/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Save, LogOut, Settings, ShieldCheck, ShoppingBag, Calendar, Package, Clock, Truck, CheckCircle2, PackageCheck, ChevronRight, CalendarCheck, FileText, Mail, MapPin, ImageIcon, Camera, Upload, Trash2, ShieldAlert } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

export default function ProfilePage() {
  const { userName, userEmail, userPhoto, userAddress, isAdmin, setUserName, setUserEmail, setUserPhoto, setUserAddress, orders } = useStore();
  const [nameInput, setNameInput] = useState(userName);
  const [emailInput, setEmailInput] = useState(userEmail);
  const [photoInput, setPhotoInput] = useState(userPhoto);
  const [addressInput, setAddressInput] = useState(userAddress);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    setNameInput(userName);
    setEmailInput(userEmail);
    setPhotoInput(userPhoto);
    setAddressInput(userAddress);
  }, [userName, userEmail, userPhoto, userAddress]);

  const lastOrder = orders.length > 0 ? orders[0] : null;

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
    setUserEmail(emailInput);
    setUserPhoto(photoInput);
    setUserAddress(addressInput);
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
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-2">Welcome, {userName}</h1>
            <p className="text-muted-foreground text-lg">{userEmail || "Manage your artisanal collection and track your orders in real-time."}</p>
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
                      <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Email Address
                      </Label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                        <Input
                          id="email"
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="yourname@example.com"
                          className="pl-12 h-14 text-lg rounded-xl border-2 focus:border-accent transition-all bg-muted/10"
                        />
                      </div>
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
                    <Label htmlFor="address" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Shipping Address
                    </Label>
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
                          localStorage.clear();
                          window.location.reload();
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

            {/* Tracking Section for Latest Order */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-headline font-bold text-primary flex items-center gap-3">
                  <Truck className="h-6 w-6 text-accent" />
                  Active Order Tracking
                </h2>
                {lastOrder && (
                  <Button asChild variant="outline" size="sm" className="rounded-full gap-2 border-accent text-accent hover:bg-accent/10">
                    <Link href={`/order/${lastOrder.id}/bill`}>
                      <FileText className="h-4 w-4" />
                      View Bill
                    </Link>
                  </Button>
                )}
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
                            <p className="text-xl font-bold text-primary">{lastOrder.status}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Estimated Arrival</p>
                            <p className="text-xl font-bold text-accent flex items-center justify-end gap-2">
                              <Clock className="h-5 w-5" />
                              {getDaysToGo(lastOrder.date, lastOrder.status)}
                            </p>
                          </div>
                        </div>

                        <div className="relative py-4">
                          <Progress value={getStatusProgress(lastOrder.status)} className="h-3 bg-muted rounded-full" />
                          <div className="flex justify-between mt-6">
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
                          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Package Contents</h4>
                          <div className="space-y-3">
                            {lastOrder.items.map((item, i) => (
                              <div key={i} className="flex items-center gap-4 bg-muted/30 p-2 rounded-lg border border-muted">
                                <div className="h-12 w-12 rounded border overflow-hidden shrink-0 bg-white">
                                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-primary truncate">{item.name}</p>
                                  <p className="text-[10px] text-muted-foreground">Quantity: {item.quantity}</p>
                                </div>
                                <span className="text-xs font-bold text-accent">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 pt-4 border-t border-dashed flex justify-between items-center">
                            <span className="text-xs font-bold text-muted-foreground uppercase">Total Paid</span>
                            <span className="text-lg font-bold text-primary">₹{lastOrder.total.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
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
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {isAdmin ? (
              <Card className="border-none shadow-2xl overflow-hidden bg-primary text-primary-foreground sticky top-28">
                <div className="h-2 bg-accent" />
                <CardHeader className="pt-8 px-8">
                  <div className="flex items-center gap-3 text-accent font-bold mb-2">
                    <ShieldCheck className="h-6 w-6" />
                    <span className="uppercase tracking-widest text-xs">Admin Status</span>
                  </div>
                  <CardTitle className="font-headline text-2xl">Store Manager</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-8">
                  <p className="text-primary-foreground/70 text-sm leading-relaxed">
                    You have administrative access to the V-WOOD QUARTZ catalog. Manage products, update order statuses, and adjust store settings from your dashboard.
                  </p>
                  <Button asChild size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold h-14 rounded-xl shadow-xl shadow-accent/20">
                    <Link href="/admin">
                      <Settings className="mr-2 h-5 w-5" />
                      Enter Dashboard
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-none shadow-2xl overflow-hidden bg-white border-t-4 border-t-accent sticky top-28">
                <CardHeader className="p-8">
                  <div className="flex items-center gap-3 text-accent font-bold mb-2">
                    <ShoppingBag className="h-6 w-6" />
                    <span className="uppercase tracking-widest text-xs">Member Status</span>
                  </div>
                  <CardTitle className="font-headline text-2xl">Artisanal Collector</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    As a valued customer, you can track all your handcrafted timepieces here. We preserve your order history locally for your privacy.
                  </p>
                  <div className="mt-8 pt-8 border-t border-dashed">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 italic">Privacy Focus</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                      Your data is stored securely in your browser's local cache. No personal information is transmitted to our servers until you proceed to a verified checkout.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
