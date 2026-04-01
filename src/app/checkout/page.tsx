"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useStore } from "@/app/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle, Truck, CreditCard, ShieldCheck, Wallet, Banknote, Smartphone, AlertCircle, QrCode, ExternalLink, Info, Loader2, ArrowRight, ShieldAlert, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Order } from "@/app/lib/types";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', color: '#4285F4', scheme: 'tez://pay', icon: <div className="w-8 h-8 rounded-full border-2 border-[#4285F4] flex items-center justify-center font-bold text-[#4285F4] text-[10px]">G</div>, handles: ['@okicici', '@okaxis', '@oksbi', '@okhdfcbank'] },
  { id: 'phonepe', name: 'PhonePe', color: '#5f259f', scheme: 'phonepe://pay', icon: <div className="w-8 h-8 rounded-full border-2 border-[#5f259f] flex items-center justify-center font-bold text-[#5f259f] text-[10px]">P</div>, handles: ['@ybl', '@ibl', '@axl'] },
  { id: 'paytm', name: 'Paytm', color: '#00BAF2', scheme: 'paytmmp://pay', icon: <div className="w-8 h-8 rounded-full border-2 border-[#00BAF2] flex items-center justify-center font-bold text-[#00BAF2] text-[10px]">Py</div>, handles: ['@paytm'] },
  { id: 'amazonpay', name: 'Amazon Pay', color: '#FF9900', scheme: 'amazonpay://pay', icon: <div className="w-8 h-8 rounded-full border-2 border-[#FF9900] flex items-center justify-center font-bold text-[#FF9900] text-[10px]">Az</div>, handles: ['@apl', '@amazon'] },
  { id: 'bhim', name: 'BHIM', color: '#e66a26', scheme: 'upi://pay', icon: <div className="w-8 h-8 rounded-full border-2 border-[#e66a26] flex items-center justify-center font-bold text-[#e66a26] text-[10px]">B</div>, handles: ['@upi'] },
  { id: 'any', name: 'Any UPI App', color: '#333333', scheme: 'upi://pay', icon: <Smartphone className="h-6 w-6" />, handles: [] }
];

export default function CheckoutPage() {
  const { cart, clearCart, addOrder, storeSettings, userBankName } = useStore();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'requesting' | 'request_processing' | 'awaiting_bank' | 'verifying' | 'admin_verification' | 'success'>('idle');
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'UPI' | 'COD'>('Card');
  const [upiStep, setUpiStep] = useState<'app'>('app');
  const [upiApp, setUpiApp] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    zip: "",
    upiId: "",
    cardNumber: "",
    expiry: "",
    cvc: ""
  });

  useEffect(() => {
    setMounted(true);
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 0; // Universal Free Shipping
  const total = subtotal + shipping;

  const selectedAppObj = upiApp ? UPI_APPS.find(a => a.id === upiApp) : null;
  const isUpiMatch = selectedAppObj?.handles.some(h => formData.upiId.toLowerCase().endsWith(h));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const isUpiValid = (id: string) => /^[\w.-]+@[\w.-]+$/.test(id);
  const isCardNumberValid = (num: string) => /^\d{16}$/.test(num.replace(/\s/g, ''));
  const isExpiryValid = (exp: string) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(exp);
  const isCvcValid = (cvc: string) => /^\d{3}$/.test(cvc);

  const isStep1Valid = formData.firstName && formData.lastName && formData.address && formData.city && formData.zip;

  const isPaymentValid = () => {
    if (paymentMethod === 'COD') return true;
    if (paymentMethod === 'UPI') return !!upiApp && isUpiValid(formData.upiId);
    if (paymentMethod === 'Card') {
      return isCardNumberValid(formData.cardNumber) && isExpiryValid(formData.expiry) && isCvcValid(formData.cvc);
    }
    return false;
  };

  const handleCompleteOrder = async (overrideUpiApp?: string) => {
    const activeUpiApp = overrideUpiApp || upiApp;
    
    if (paymentMethod === 'UPI' && !activeUpiApp) {
       setUpiApp('any');
    }

    if (paymentMethod === 'Card' && !isPaymentValid()) {
      toast({
        variant: "destructive",
        title: "Payment Details Required",
        description: "Please provide valid information for the selected payment method.",
      });
      return;
    }
    
    if (paymentMethod === 'UPI' && !isUpiValid(formData.upiId)) {
       toast({
        variant: "destructive",
        title: "Invalid UPI ID",
        description: "Please enter a valid UPI ID (e.g. name@upi) before sending the request.",
      });
      return;
    }

    setIsProcessing(true);

    const selectedApp = UPI_APPS.find(a => a.id === activeUpiApp);
    const isMatch = selectedApp?.handles.some(h => formData.upiId.toLowerCase().endsWith(h));

    if (paymentMethod === 'UPI') {
      const intentUrl = getDynamicUpiUrl(activeUpiApp || 'any');
      
      if (isMobile) {
        // Same Device Flow
        setPaymentStatus('requesting');
        window.location.href = intentUrl;
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setPaymentStatus('verifying'); // "Processing In-App Payment"
        await new Promise(resolve => setTimeout(resolve, 1000));
       } else {
        // Another Device / Collect Request Flow
        setPaymentStatus('requesting'); // "Sending Payment Request..."
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setPaymentStatus('request_processing'); // "Linking with NPCI..."
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setPaymentStatus('awaiting_bank'); // "Sending request to user's bank..."
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setPaymentStatus('verifying'); // "Confirming Receipt..."
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setPaymentStatus('admin_verification'); // "Payment Received!"
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } else if (paymentMethod === 'Card') {
      // 1. Connect to Secure Bank Platform
      setPaymentStatus('requesting'); // Will show "Connecting to Secured Payments..."
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // 2. Simulate User Payment (Deduction)
      setPaymentStatus('verifying'); // Will show "Deducting funds from your bank..."
      await new Promise(resolve => setTimeout(resolve, 3500));
      
      // 3. Simulate Transfer to Admin
      setPaymentStatus('admin_verification'); // Will show "Transferring to V-WOOD Admin..."
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    finalizeOrder();
  };

  const finalizeOrder = () => {
    const currentOrderId = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const newOrder: Order = {
      id: currentOrderId,
      date: new Date().toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      }),
      items: [...cart],
      total: total,
      status: (paymentMethod === 'COD' || paymentMethod === 'UPI') ? 'Confirmed' : 'Awaiting Verification',
      customerName: `${formData.firstName} ${formData.lastName}`,
      customerAddress: `${formData.address}, ${formData.city}, ${formData.zip}`,
      paymentMethod: paymentMethod
    };
    
    addOrder(newOrder);
    setStep(3);
    setIsProcessing(false);
    clearCart();
    setPaymentStatus('success');
    
    toast({
      title: (paymentMethod === 'COD' || paymentMethod === 'UPI') ? "Order Placed Successfully" : "Payment Submitted - Awaiting Verification",
      description: (paymentMethod === 'COD' || paymentMethod === 'UPI') ? "Your order is being processed." : "The V-WOOD admin will confirm your order once the payment has been verified.",
    });
  };

  const handleManualPaymentConfirmation = async () => {
    setPaymentStatus('verifying');
    await new Promise(resolve => setTimeout(resolve, 4000));
    setPaymentStatus('admin_verification');
    await new Promise(resolve => setTimeout(resolve, 3000));
    finalizeOrder();
  };

  const upiIntentUrl = `upi://pay?pa=${storeSettings.upiId}&pn=${encodeURIComponent(storeSettings.ownerName)}&am=${total}&cu=INR&tn=${encodeURIComponent('V-WOOD Order Payment')}`;



  const getDynamicUpiUrl = (overrideApp?: string) => {
    const appToUse = overrideApp || upiApp;
    const selectedApp = UPI_APPS.find(a => a.id === appToUse);
    const base = selectedApp?.scheme || 'upi://pay';
    return `${base}?pa=${storeSettings.upiId}&pn=${encodeURIComponent(storeSettings.ownerName)}&am=${total}&cu=INR&tn=${encodeURIComponent('V-WOOD Order Payment')}`;
  };

  if (!mounted) return null;

  if (step === 3) {
    const orderId = `VWD-${Math.floor(100000 + Math.random() * 900000)}`;
    const orderDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full space-y-8 animate-in fade-in zoom-in duration-700">
            <Card className="border-none shadow-[0_30px_100px_rgba(0,0,0,0.15)] rounded-[3rem] overflow-hidden bg-white">
              <CardHeader className="bg-primary text-primary-foreground p-10 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-accent/30" />
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/20 text-accent mb-6 shadow-xl border border-white/10">
                  <CheckCircle className="h-10 w-10" />
                </div>
                <CardTitle className="text-4xl font-headline font-bold">Digital Receipt</CardTitle>
                <p className="text-primary-foreground/60 text-xs uppercase tracking-[0.4em] mt-3">V-WOOD QUARTZ MORBI</p>
              </CardHeader>
              
              <CardContent className="p-12 space-y-10">
                <div className="grid grid-cols-2 gap-8 text-[12px]">
                  <div className="space-y-1">
                    <p className="font-bold text-muted-foreground uppercase tracking-widest">Order ID</p>
                    <p className="text-lg font-bold text-primary">#{orderId}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="font-bold text-muted-foreground uppercase tracking-widest">Transaction Date</p>
                    <p className="text-lg font-bold text-primary">{orderDate}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-dashed">
                  <p className="text-sm font-bold text-primary uppercase tracking-widest">Items Purchased</p>
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center border font-bold text-primary">
                            {item.quantity}x
                          </div>
                          <span className="font-bold text-primary">{item.name}</span>
                        </div>
                        <span className="font-medium">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-dashed">
                  <div className="flex justify-between items-center text-2xl font-bold text-primary">
                    <span className="font-headline tracking-tighter">Net Total</span>
                    <span className="text-accent">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                  {paymentMethod === 'COD' || paymentMethod === 'UPI' ? (
                    <div className="p-4 bg-accent/5 rounded-2xl border border-accent/20 flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5 text-accent" />
                      <p className="text-[10px] font-bold text-black/60 uppercase tracking-widest">Order Confirmed - {paymentMethod === 'COD' ? 'Cash on Delivery' : 'UPI Payment Verified'}</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-200 flex items-center gap-3">
                      <Clock className="h-5 w-5 text-yellow-600 animate-pulse" />
                      <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest">Awaiting Admin Payment Verification</p>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-dashed">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Shipment To</p>
                  <p className="text-sm font-medium leading-relaxed">
                    {formData.firstName} {formData.lastName}<br />
                    {formData.address}, {formData.city}, {formData.zip}
                  </p>
                </div>

                <div className="pt-6 border-t border-dashed">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 text-accent">Artisanal Shipment Arrival</p>
                  <div className="flex items-center gap-4 bg-accent/5 p-5 rounded-2xl border border-accent/20">
                    <Truck className="h-6 w-6 text-accent shrink-0" />
                    <div>
                      <p className="font-bold text-primary text-sm">
                        {new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { 
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Standard Artisanal Delivery</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 pt-10 border-t mt-6">
                  <div className="relative h-20 w-20">
                    <Image 
                      src="/v-wood-seal.png" 
                      alt="V-WOOD Seal" 
                      fill 
                      className="object-contain drop-shadow-md" 
                    />
                  </div>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.4em] mt-1">Official Masterpiece Seal</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center">
               <Button asChild size="lg" className="h-16 px-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 text-lg">
                <Link href="/">Back to Storefront</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-primary text-white shadow-lg' : 'bg-muted'}`}>1</div>
            <div className="w-12 h-0.5 bg-muted"></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-primary text-white shadow-lg' : 'bg-muted'}`}>2</div>
            <div className="w-12 h-0.5 bg-muted"></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold bg-muted`}>3</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            {step === 1 ? (
              <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-primary text-primary-foreground p-8">
                  <CardTitle className="font-headline text-2xl flex items-center gap-3">
                    <Truck className="h-6 w-6 text-accent" /> Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" value={formData.firstName} onChange={handleInputChange} className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" value={formData.lastName} onChange={handleInputChange} className="h-12 rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleInputChange} className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Full Shipping Address</Label>
                    <Input id="address" placeholder="123 Wood Street" value={formData.address} onChange={handleInputChange} className="h-12 rounded-xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" placeholder="Morbi" value={formData.city} onChange={handleInputChange} className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">PIN Code</Label>
                      <Input id="zip" placeholder="363641" value={formData.zip} onChange={handleInputChange} className="h-12 rounded-xl" />
                    </div>
                  </div>
                  <Button 
                    className="w-full h-14 text-lg font-bold bg-accent hover:bg-accent/90 text-accent-foreground rounded-2xl shadow-xl shadow-accent/10 mt-4 transition-all active:scale-95" 
                    onClick={() => setStep(2)}
                    disabled={!isStep1Valid}
                  >
                    Proceed to Secure Payment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-primary text-primary-foreground p-8">
                  <CardTitle className="font-headline text-2xl flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-accent" /> Select Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 p-8">
                  <RadioGroup 
                    value={paymentMethod} 
                    onValueChange={(val) => {
                      const method = val as 'Card' | 'UPI' | 'COD';
                      setPaymentMethod(method);
                      if (method === 'UPI') setUpiStep('app');
                    }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                    disabled={isProcessing}
                  >
                    <div>
                      <RadioGroupItem value="UPI" id="upi-pay" className="peer sr-only" />
                      <Label
                        htmlFor="upi-pay"
                        className="flex flex-col items-center justify-center rounded-2xl border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/10 peer-data-[state=checked]:text-accent cursor-pointer transition-all h-full gap-3 font-bold"
                      >
                        <Smartphone className="h-8 w-8" />
                        UPI / GPay
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="Card" id="card-pay" className="peer sr-only" />
                      <Label
                        htmlFor="card-pay"
                        className="flex flex-col items-center justify-center rounded-2xl border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/10 peer-data-[state=checked]:text-accent cursor-pointer transition-all h-full gap-3 font-bold"
                      >
                        <CreditCard className="h-8 w-8" />
                        Credit Card
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="COD" id="cod-pay" className="peer sr-only" />
                      <Label
                        htmlFor="cod-pay"
                        className="flex flex-col items-center justify-center rounded-2xl border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/10 peer-data-[state=checked]:text-accent cursor-pointer transition-all h-full gap-3 font-bold"
                      >
                        <Banknote className="h-8 w-8" />
                        Cash on Delivery
                      </Label>
                    </div>
                  </RadioGroup>

                  <div className="space-y-6 pt-6 border-t">
                    {paymentMethod === 'UPI' && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-6">
                            {!upiApp ? (
                              <div className="space-y-4">
                                <Label className="text-lg font-bold flex items-center gap-2">
                                  <Smartphone className="h-5 w-5 text-accent" /> Choose your UPI App
                                </Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                  {UPI_APPS.map((app) => (
                                    <Button
                                      key={app.id}
                                      variant="outline"
                                      className={cn(
                                        "flex flex-col items-center justify-center p-4 h-24 rounded-2xl border-2 transition-all hover:border-accent hover:bg-accent/5",
                                        upiApp === app.id ? "border-accent bg-accent/10" : "border-muted"
                                      )}
                                      onClick={() => setUpiApp(app.id)}
                                    >
                                      <div style={{ color: app.color }} className="mb-2">
                                        {app.icon}
                                      </div>
                                      <span className="text-[10px] font-bold uppercase tracking-wider">{app.name}</span>
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-accent/5 rounded-2xl border border-accent/20">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-xl shadow-sm text-accent">
                                      {UPI_APPS.find(a => a.id === upiApp)?.icon}
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Paying with</p>
                                      <p className="font-bold text-primary">{UPI_APPS.find(a => a.id === upiApp)?.name}</p>
                                      <p className="text-[10px] text-accent font-bold mt-1">
                                        {upiApp === 'gpay' ? (userBankName || "Bank not available") : ""}
                                      </p>
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="sm" onClick={() => setUpiApp(null)} className="text-accent underline font-bold h-8">
                                    Change App
                                  </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                  <div className="space-y-6">
                                    <div className="space-y-2">
                                      <Label htmlFor="upiId" className={cn("font-bold text-xs uppercase tracking-widest text-muted-foreground", formData.upiId && !isUpiValid(formData.upiId) && "text-destructive")}>
                                        Enter your UPI ID
                                      </Label>
                                      <Input 
                                        id="upiId" 
                                        placeholder="yourname@upi" 
                                        value={formData.upiId} 
                                        onChange={handleInputChange} 
                                        className={cn(
                                          "h-12 rounded-xl text-lg",
                                          formData.upiId && !isUpiValid(formData.upiId) ? "border-destructive" : "focus:border-accent"
                                        )}
                                        disabled={isProcessing}
                                      />
                                    </div>
                                    <div className="p-4 bg-muted/30 rounded-2xl border space-y-3">
                                      <div className="flex items-start gap-3">
                                        <ShieldCheck className="h-5 w-5 text-accent shrink-0" />
                                        <div className="space-y-1">
                                          <p className="text-xs font-bold uppercase tracking-wider text-primary">Admin Payment Details</p>
                                          <div className="space-y-1">
                                            <p className="text-sm font-medium"><span className="text-muted-foreground mr-1">Name:</span> {storeSettings.ownerName}</p>
                                            <p className="text-sm font-medium"><span className="text-muted-foreground mr-1">UPI ID:</span> {storeSettings.upiId}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Your UPI ID</p>
                                      <p className="text-sm font-bold text-primary">{formData.upiId}</p>
                                    </div>
                                  </div>

                                  <div className="flex flex-col items-center justify-center p-6 bg-white rounded-[2.5rem] border-2 border-dashed border-accent/20 shadow-xl relative group">
                                    <div className="relative w-48 h-48 mb-4 overflow-hidden rounded-2xl border-4 border-white shadow-lg bg-white p-2 flex items-center justify-center">
                                      <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(upiIntentUrl)}`}
                                        alt="Payment QR Code"
                                        className="max-w-full max-h-full object-contain"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = "https://placehold.co/400x400?text=Scan+to+Pay";
                                        }}
                                      />
                                    </div>
                                    <div className="flex items-center gap-2 text-accent font-bold">
                                      <QrCode className="h-4 w-4" />
                                      <span className="text-[10px] uppercase tracking-widest">Scan to Pay Instantly</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                      </div>
                    )}

                    {paymentMethod === 'Card' && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-2">
                          <Label htmlFor="cardNumber" className={cn(formData.cardNumber && !isCardNumberValid(formData.cardNumber) && "text-destructive")}>
                            Card Number
                          </Label>
                          <Input 
                            id="cardNumber" 
                            placeholder="1234 5678 1234 5678" 
                            value={formData.cardNumber} 
                            onChange={handleInputChange} 
                            className={cn(
                              "h-12 rounded-xl text-lg tracking-[0.2em]",
                              formData.cardNumber && !isCardNumberValid(formData.cardNumber) && "border-destructive"
                            )}
                            disabled={isProcessing}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiry">Expiry</Label>
                            <Input id="expiry" placeholder="MM/YY" value={formData.expiry} onChange={handleInputChange} className="h-12 rounded-xl" disabled={isProcessing} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvc">CVC</Label>
                            <Input id="cvc" placeholder="123" value={formData.cvc} onChange={handleInputChange} className="h-12 rounded-xl" disabled={isProcessing} />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'COD' && (
                      <div className="p-10 bg-muted/20 rounded-[2.5rem] border-2 border-dashed text-center animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                          <Banknote className="h-10 w-10 text-accent" />
                        </div>
                        <h3 className="text-xl font-headline font-bold text-primary">Cash on Delivery</h3>
                        <p className="text-sm text-muted-foreground mt-3 max-w-sm mx-auto">Pay ₹{total.toLocaleString('en-IN')} in cash when your artisanal piece arrives.</p>
                      </div>
                    )}


                    <div className="flex gap-4 pt-6 border-t">
                      <Button variant="outline" className="flex-1 h-14 rounded-2xl text-lg font-bold" onClick={() => setStep(1)} disabled={isProcessing}>
                        Back
                      </Button>
                      <Button 
                        className="flex-[2] h-14 text-xl font-bold bg-accent hover:bg-accent/90 text-accent-foreground rounded-2xl shadow-2xl transition-all active:scale-95" 
                        onClick={() => handleCompleteOrder()}
                        disabled={!isPaymentValid() || isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                            {paymentStatus === 'requesting' ? 'Requesting...' : 
                             paymentStatus === 'admin_verification' ? 'Admin Verifying...' : 'Verifying Payment...'}
                          </>
                        ) : (
                          paymentMethod === 'UPI' ? 'Pay Now & Confirm' : 'Complete Purchase'
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="bg-primary text-primary-foreground border-none shadow-2xl rounded-[2.5rem] overflow-hidden sticky top-24">
              <CardHeader className="bg-white/5 p-8 border-b border-white/10">
                <CardTitle className="font-headline text-2xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center gap-4">
                      <div className="flex gap-4 items-center min-w-0">
                        <div className="relative h-14 w-14 rounded-xl bg-white/10 shrink-0 overflow-hidden border border-white/20 p-1">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold truncate text-sm">{item.name}</p>
                          <p className="text-[10px] text-primary-foreground/60">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-bold text-sm">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4 border-t border-white/10 pt-6">
                  <div className="flex justify-between text-sm text-primary-foreground/60">
                    <span>Subtotal</span>
                    <span className="font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm text-primary-foreground/60">
                    <span>Shipping</span>
                    <span className="text-accent font-bold">FREE</span>
                  </div>
                  <div className="flex justify-between text-2xl font-bold pt-4 border-t border-white/20 text-white">
                    <span>Total</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>


                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                  <ShieldCheck className="h-5 w-5 text-accent mx-auto mb-2" />
                  <p className="text-[10px] text-primary-foreground/40 uppercase tracking-widest font-bold">Secure V-WOOD Payment</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
