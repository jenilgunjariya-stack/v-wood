"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useStore } from "@/app/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle, Truck, CreditCard, ShieldCheck, Wallet, Banknote, Smartphone, AlertCircle, QrCode, ExternalLink, Info, Loader2, ArrowRight, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Order } from "@/app/lib/types";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function CheckoutPage() {
  const { cart, clearCart, addOrder, storeSettings } = useStore();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'requesting' | 'verifying' | 'success'>('idle');
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'UPI' | 'COD'>('Card');
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

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 0; // Universal Free Shipping
  const total = subtotal + shipping;

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
    if (paymentMethod === 'UPI') return isUpiValid(formData.upiId);
    if (paymentMethod === 'Card') {
      return isCardNumberValid(formData.cardNumber) && isExpiryValid(formData.expiry) && isCvcValid(formData.cvc);
    }
    return false;
  };

  const handleCompleteOrder = async () => {
    if (!isPaymentValid()) {
      toast({
        variant: "destructive",
        title: "Payment Details Required",
        description: "Please provide valid information for the selected payment method.",
      });
      return;
    }

    setIsProcessing(true);

    if (paymentMethod === 'UPI') {
      // 1. Simulate Sending Request
      setPaymentStatus('requesting');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 2. Simulate Waiting for User Approval in their App
      setPaymentStatus('verifying');
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      setPaymentStatus('success');
    } else if (paymentMethod === 'Card') {
      setPaymentStatus('verifying');
      await new Promise(resolve => setTimeout(resolve, 3000));
      setPaymentStatus('success');
    }

    const newOrder: Order = {
      id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      date: new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      items: [...cart],
      total: total,
      status: 'Processing',
      customerName: `${formData.firstName} ${formData.lastName}`,
      customerAddress: `${formData.address}, ${formData.city}, ${formData.zip}`,
      paymentMethod: paymentMethod
    };
    
    addOrder(newOrder);
    setStep(3);
    setIsProcessing(false);
    clearCart();
    
    toast({
      title: "Payment Successful",
      description: "Your order has been placed and confirmed.",
    });
  };

  const upiIntentUrl = `upi://pay?pa=${storeSettings.upiId}&pn=${encodeURIComponent(storeSettings.name)}&am=${total}&cu=INR&tn=${encodeURIComponent('Order Payment')}`;

  if (!mounted) return null;

  if (step === 3) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-accent/20 text-accent">
              <CheckCircle className="h-12 w-12" />
            </div>
            <h1 className="text-4xl font-headline font-bold text-primary">Order Confirmed!</h1>
            <p className="text-muted-foreground">Thank you for choosing V-WOOD QUARTZ. Your payment of ₹{total.toLocaleString('en-IN')} has been received and verified.</p>
            <div className="pt-8">
              <Button asChild size="lg" className="w-full h-14 bg-primary hover:bg-primary/90 rounded-xl">
                <Link href="/">Return to Storefront</Link>
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
                      <Label htmlFor="zip">ZIP Code</Label>
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
                    onValueChange={(val) => setPaymentMethod(val as 'Card' | 'UPI' | 'COD')}
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
                      <div className="space-y-10 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <Label htmlFor="upiId" className={cn("font-bold text-sm", formData.upiId && !isUpiValid(formData.upiId) && "text-destructive")}>
                                Your UPI ID (A request will be sent here)
                              </Label>
                              <Input 
                                id="upiId" 
                                placeholder="example@oksbi" 
                                value={formData.upiId} 
                                onChange={handleInputChange} 
                                className={cn(
                                  "h-12 rounded-xl text-lg",
                                  formData.upiId && !isUpiValid(formData.upiId) ? "border-destructive" : "focus:border-accent"
                                )}
                                disabled={isProcessing}
                              />
                              {formData.upiId && !isUpiValid(formData.upiId) && (
                                <p className="text-[10px] text-destructive flex items-center gap-1 font-bold">
                                  <AlertCircle className="h-3 w-3" />
                                  Enter a valid UPI ID (e.g. name@upi)
                                </p>
                              )}
                            </div>

                            <div className="space-y-4">
                              <Label className="text-sm font-bold">Direct Mobile Apps</Label>
                              <div className="grid grid-cols-2 gap-3">
                                <Button asChild variant="outline" className="h-14 rounded-xl gap-2 hover:border-[#4285F4] hover:bg-[#4285F4]/5">
                                  <a href={upiIntentUrl}>
                                    <Smartphone className="h-4 w-4 text-[#4285F4]" />
                                    Open GPay
                                  </a>
                                </Button>
                                <Button asChild variant="outline" className="h-14 rounded-xl gap-2 hover:border-[#5f259f] hover:bg-[#5f259f]/5">
                                  <a href={upiIntentUrl}>
                                    <Smartphone className="h-4 w-4 text-[#5f259f]" />
                                    PhonePe
                                  </a>
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-center justify-center p-8 bg-white rounded-[2.5rem] border-2 border-dashed border-accent/20 shadow-2xl">
                            <div className="relative w-64 h-64 mb-6 overflow-hidden rounded-3xl border-4 border-white shadow-xl bg-white p-2 flex items-center justify-center">
                              <img 
                                src={storeSettings.paymentQrCodeUrl}
                                alt="Payment QR Code"
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://placehold.co/400x400?text=Scan+to+Pay";
                                }}
                              />
                            </div>
                            <div className="flex items-center gap-2 px-6 py-2 bg-accent/10 text-accent rounded-full font-bold">
                              <QrCode className="h-5 w-5" />
                              <span className="text-xs uppercase tracking-widest">Scan to Pay</span>
                            </div>
                          </div>
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

                    {isProcessing && paymentMethod === 'UPI' && (
                      <Card className="bg-primary/5 border-2 border-accent border-dashed p-8 text-center animate-in zoom-in duration-300">
                        {paymentStatus === 'requesting' && (
                          <div className="space-y-4">
                            <Loader2 className="h-10 w-10 animate-spin text-accent mx-auto" />
                            <h4 className="text-lg font-bold text-primary">Sending Request to {formData.upiId}...</h4>
                            <p className="text-sm text-muted-foreground">Please keep your UPI app ready.</p>
                          </div>
                        )}
                        {paymentStatus === 'verifying' && (
                          <div className="space-y-4">
                            <ShieldAlert className="h-10 w-10 text-accent mx-auto animate-pulse" />
                            <h4 className="text-lg font-bold text-primary">Waiting for Approval</h4>
                            <p className="text-sm text-muted-foreground">Open your GPay app and approve the ₹{total.toLocaleString('en-IN')} payment request.</p>
                          </div>
                        )}
                      </Card>
                    )}

                    <div className="flex gap-4 pt-6 border-t">
                      <Button variant="outline" className="flex-1 h-14 rounded-2xl text-lg font-bold" onClick={() => setStep(1)} disabled={isProcessing}>
                        Back
                      </Button>
                      <Button 
                        className="flex-[2] h-14 text-xl font-bold bg-accent hover:bg-accent/90 text-accent-foreground rounded-2xl shadow-2xl transition-all active:scale-95" 
                        onClick={handleCompleteOrder}
                        disabled={!isPaymentValid() || isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                            {paymentStatus === 'requesting' ? 'Requesting...' : 'Verifying Payment...'}
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
