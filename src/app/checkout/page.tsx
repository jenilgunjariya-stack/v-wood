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
import { Badge } from "@/components/ui/badge";
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
  const { cart, clearCart, addOrder, storeSettings, userBankName, userName } = useStore();
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
    phone: "",
    address: "",
    city: "",
    zip: "",
    upiId: "",
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvc: "",
    otp: ""
  });
  const [otpMode, setOtpMode] = useState(false);
  const [gatewayMode, setGatewayMode] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [timer, setTimer] = useState(180); // 3 minutes

  useEffect(() => {
    setMounted(true);
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (paymentStatus === 'awaiting_bank' && paymentMethod === 'UPI' && !isMobile) {
      interval = setInterval(() => {
        setTimer(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [paymentStatus, paymentMethod, isMobile]);

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
  const isPhoneValid = (phone: string) => /^\+?(\d{10,12})$/.test(phone.replace(/\s/g, ''));

  const isStep1Valid = formData.firstName && formData.lastName && formData.phone && formData.address && formData.city && formData.zip;

  const isPaymentValid = () => {
    if (paymentMethod === 'COD') return true;
    if (paymentMethod === 'UPI') return !!upiApp && isUpiValid(formData.upiId);
    if (paymentMethod === 'Card') {
      return isCardNumberValid(formData.cardNumber) && isExpiryValid(formData.expiry) && isCvcValid(formData.cvc) && formData.cardName.length > 2;
    }
    return false;
  };

  const upiIntentUrl = `upi://pay?pa=${storeSettings.upiId}&pn=${encodeURIComponent(storeSettings.ownerName)}&am=${total}&cu=INR&tn=${encodeURIComponent('V-WOOD Order Payment')}`;
  const getDynamicUpiUrl = (overrideApp?: string) => {
    const appToUse = overrideApp || upiApp;
    const selectedApp = UPI_APPS.find(a => a.id === appToUse);
    const base = selectedApp?.scheme || 'upi://pay';
    return `${base}?pa=${storeSettings.upiId}&pn=${encodeURIComponent(storeSettings.ownerName)}&am=${total}&cu=INR&tn=${encodeURIComponent('V-WOOD Order Payment')}`;
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
    
    if (paymentMethod === 'Card' && !isPaymentValid()) {
      toast({
        variant: "destructive",
        title: "Incomplete Card Details",
        description: "Please provide all required card information.",
      });
      return;
    }
    
    if (paymentMethod === 'UPI' && !isUpiValid(formData.upiId)) {
       toast({
        variant: "destructive",
        title: "Invalid UPI ID",
        description: "Please enter a valid UPI ID (e.g. name@upi) to proceed.",
      });
      return;
    }

    setIsProcessing(true);

    const activeApp = overrideUpiApp || upiApp;

    if (paymentMethod === 'UPI') {
      if (!isUpiValid(formData.upiId)) return;
      
      setPaymentStatus('requesting'); // "Sending Payment Request..."
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (formData.upiId === 'fail@upi') {
        setPaymentError("UPI Request Failed: The payment request was declined by your bank. Please use a different UPI ID or payment method.");
        setPaymentStatus('idle');
        setIsProcessing(false);
        return;
      }
      
      if (isMobile) {
        window.location.href = getDynamicUpiUrl(activeApp || 'any');
        setPaymentStatus('verifying'); 
        await new Promise(r => setTimeout(r, 4000));
        setPaymentStatus('admin_verification');
        await new Promise(r => setTimeout(r, 2000));
        finalizeOrder();
      } else {
        setPaymentStatus('awaiting_bank'); // "Open UPI App & Approve"
        setTimer(180);
        setIsProcessing(false); 
      }
    } else if (paymentMethod === 'Card') {
      if (!isPaymentValid()) return;
      setIsRedirecting(true);
      setPaymentStatus('requesting'); 
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsRedirecting(false);
      setGatewayMode(true);
      setPaymentStatus('awaiting_bank'); 
      await new Promise(resolve => setTimeout(resolve, 1500));
      setOtpMode(true);
      setIsProcessing(false);
    } else if (paymentMethod === 'COD') {
      finalizeOrder();
    }
  };

  const handleOtpSubmit = async (otp: string) => {
    if (otp.length < 6) return;
    
    setIsProcessing(true);
    setOtpMode(false);
    setPaymentError(null);
    
    // 4. Verification of OTP
    setPaymentStatus('verifying'); // "Authenticating 3D Secure..."
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulated Failure Logic for Testing
    if (otp === '000000') {
      setPaymentError("Authentication Failed: The authorization code entered is incorrect or expired. Please try again.");
      setGatewayMode(false);
      setIsProcessing(false);
      setPaymentStatus('idle');
      return;
    }
    
    // 5. Deduction from User Account
    setPaymentStatus('request_processing'); // "Capturing Funds from Account..."
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // 6. Settlement with Admin
    setPaymentStatus('admin_verification'); // "Settling Transaction with V-WOOD Admin..."
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    finalizeOrder();
  };

  function finalizeOrder() {
    const currentOrderId = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const transactionId = `TXN-${Math.random().toString(36).substr(2, 12).toUpperCase()}`;
    
    const newOrder: Order = {
      id: currentOrderId,
      date: new Date().toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      }),
      items: cart,
      total: total,
      status: (paymentMethod === 'COD' || paymentMethod === 'UPI' || paymentMethod === 'Card') ? 'Confirmed' : 'Awaiting Verification',
      customerName: `${formData.firstName} ${formData.lastName}`,
      customerAddress: `${formData.address}, ${formData.city}, ${formData.zip}`,
      customerPhone: formData.phone,
      customerEmail: formData.email,
      paymentMethod: paymentMethod,
      userName: userName,
      transactionId: transactionId,
      upiId: paymentMethod === 'UPI' ? formData.upiId : undefined,
      cardLast4: paymentMethod === 'Card' ? formData.cardNumber.replace(/\s/g, '').slice(-4) : undefined,
      cardHolderName: paymentMethod === 'Card' ? formData.cardName : undefined
    };
    
    addOrder(newOrder);
    setStep(3);
    setIsProcessing(false);
    setPaymentStatus('success');
    clearCart();
    
    toast({
      title: "Payment Successful & Settled",
      description: paymentMethod === 'COD' 
        ? "Your order has been confirmed. Please keep cash ready for delivery."
        : `Transaction ${transactionId} processed. Funds settled with V-WOOD Admin account.`,
    });
  }

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
             <div className="text-center space-y-6">
               <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/30">
                 <CheckCircle className="h-12 w-12 text-white" />
               </div>
               <div className="space-y-2">
                 <h1 className="text-5xl font-headline font-bold text-primary">Transaction Secured</h1>
                 <p className="text-muted-foreground text-lg">Your artisanal acquisition has been verified and settled.</p>
               </div>
             </div>

             <Card className="bg-white border-none shadow-2xl rounded-[3rem] overflow-hidden">
               <div className="bg-primary p-8 text-primary-foreground flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60">Order ID</p>
                    <p className="text-xl font-bold font-mono">#{orderId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60">Status</p>
                    <Badge className="bg-accent text-accent-foreground border-none font-black uppercase tracking-widest px-4">PAYMENT SETTLED</Badge>
                  </div>
               </div>
               
               <CardContent className="p-10 space-y-10">
                 <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-4">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Beneficiary Details (Admin)</p>
                       <div className="p-5 bg-muted/20 rounded-2xl border-2 border-dashed">
                          <p className="text-sm font-bold text-primary">{storeSettings.ownerName}</p>
                          <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-widest">{storeSettings.bankName}</p>
                          <p className="text-xs font-mono text-accent mt-2">A/C: •••• {storeSettings.accountNumber?.slice(-4) || '8352'}</p>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Acquisition Timestamp</p>
                       <div className="space-y-2">
                          <p className="text-sm font-bold">{orderDate}</p>
                          <div className="flex items-center gap-2 text-green-600">
                             <ShieldCheck className="h-4 w-4" />
                             <span className="text-[10px] font-black uppercase tracking-tighter text-green-700">V-WOOD GATEWAY PROTECTED</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4 pt-8 border-t border-dashed">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Settlement Invoice Summary</p>
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between items-center bg-muted/5 p-4 rounded-xl border">
                        <span className="font-bold text-sm">{item.name} <span className="text-muted-foreground text-xs ml-2">x{item.quantity}</span></span>
                        <span className="font-bold text-primary">Rs. {(item.price * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                    <div className="bg-primary text-primary-foreground p-6 rounded-2xl flex justify-between items-center shadow-lg transform scale-[1.02]">
                       <span className="text-lg font-headline font-bold">Total Disbursed</span>
                       <span className="text-3xl font-bold text-accent">Rs. {total.toLocaleString('en-IN')}/-</span>
                    </div>
                 </div>

                 <div className="flex gap-4 pt-4">
                    <Button variant="outline" className="flex-1 h-14 rounded-2xl font-bold text-lg" asChild>
                      <Link href="/profile">View History</Link>
                    </Button>
                    <Button className="flex-1 h-14 rounded-2xl font-bold text-lg bg-accent text-accent-foreground" asChild>
                      <Link href="/">Back to Studio</Link>
                    </Button>
                 </div>
               </CardContent>
             </Card>
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
                    <Label htmlFor="phone" className={cn(formData.phone && !isPhoneValid(formData.phone) && "text-destructive")}>Phone Number</Label>
                    <Input id="phone" placeholder="+91 00000 00000" value={formData.phone} onChange={handleInputChange} className="h-12 rounded-xl" />
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
                  <>
                  {paymentError && (
                    <div className="p-4 bg-destructive/10 border-2 border-destructive/20 rounded-2xl flex items-center gap-4 animate-in shake duration-500">
                      <AlertCircle className="h-6 w-6 text-destructive" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-destructive uppercase tracking-widest">Transaction Error</p>
                        <p className="text-sm text-primary font-medium">{paymentError}</p>
                      </div>
                      <Button variant="outline" size="sm" className="h-10 rounded-xl" onClick={() => setPaymentError(null)}>Retry</Button>
                    </div>
                  )}

                  {isRedirecting ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
                      <div className="relative">
                        <Loader2 className="h-16 w-16 text-accent animate-spin" />
                        <ShieldCheck className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-headline font-bold">Redirecting to Secure Gateway</h3>
                        <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">Authenticating with V-WOOD PAY Network...</p>
                      </div>
                    </div>
                  ) : gatewayMode ? (
                    <div className="space-y-8 animate-in zoom-in duration-500 py-6 max-w-lg mx-auto">
                        <div className="bg-white rounded-[2.5rem] border-4 border-primary/5 shadow-2xl p-10 space-y-8 relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16" />
                           
                           <div className="flex items-center justify-between">
                             <div className="h-8 w-24 bg-muted/30 rounded flex items-center justify-center grayscale text-[10px] font-black italic">
                               {formData.cardNumber.startsWith('4') ? 'VISA Secure' : 'Mastercard ID Check'}
                             </div>
                             <div className="flex items-center gap-2 text-primary">
                               <ShieldCheck className="h-5 w-5 text-accent" />
                               <span className="text-xs font-bold uppercase tracking-widest">GATEWAY ACTIVE</span>
                             </div>
                           </div>

                           <div className="text-center space-y-4">
                             <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-lg">
                               <Clock className="h-10 w-10 text-accent animate-pulse" />
                             </div>
                             <div className="space-y-2">
                               <h3 className="text-2xl font-headline font-bold text-primary">Verification Required</h3>
                               <p className="text-xs text-muted-foreground leading-relaxed px-10">
                                 A direct bank transfer of <span className="text-primary font-black">Rs. {total.toLocaleString('en-IN')}</span> to <span className="text-accent underline decoration-2">{storeSettings.ownerName}</span> is pending. Enter OTP.
                               </p>
                             </div>
                           </div>

                           <div className="space-y-6">
                             <div className="space-y-2">
                               <Label htmlFor="otp" className="sr-only">Enter OTP</Label>
                               <div className="relative">
                                 <Input 
                                   id="otp" 
                                   placeholder="0 0 0 0 0 0" 
                                   maxLength={6}
                                   value={formData.otp} 
                                   onChange={(e) => {
                                     const val = e.target.value.replace(/\D/g, '');
                                     setFormData(prev => ({ ...prev, otp: val }));
                                   }}
                                   className="h-20 rounded-2xl text-center text-4xl font-black tracking-[0.5em] border-primary/10 focus:border-accent bg-muted/5 shadow-inner transition-all"
                                 />
                               </div>
                               <div className="flex justify-between items-center px-2">
                                 <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Expires in 03:00</div>
                                 <button className="text-[10px] font-bold text-accent hover:text-accent/80 uppercase tracking-widest transition-colors">Resend Code</button>
                               </div>
                             </div>

                             <Button 
                               className="w-full h-16 text-xl font-bold bg-accent hover:bg-accent/90 text-accent-foreground rounded-2xl shadow-xl shadow-accent/20 transition-all hover:scale-[1.02] active:scale-95 group"
                               onClick={() => handleOtpSubmit(formData.otp)}
                               disabled={isProcessing || formData.otp.length < 6}
                             >
                               {isProcessing ? (
                                 <div className="flex items-center gap-3">
                                   <Loader2 className="animate-spin h-6 w-6" />
                                   <span>Processing Settlement...</span>
                                 </div>
                               ) : (
                                 <div className="flex items-center gap-3">
                                   <span>Confirm Transfer</span>
                                   <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                 </div>
                               )}
                             </Button>
                           </div>

                           <div className="pt-6 border-t border-dashed flex justify-center gap-8 opacity-20 filter grayscale">
                             <div className="text-[8px] font-black tracking-tighter">PCI-DSS COMPLIANT</div>
                             <div className="text-[8px] font-black tracking-tighter">SECURED BY MASTERPASS</div>
                           </div>
                        </div>
                        <Button variant="ghost" className="w-full text-muted-foreground hover:text-destructive text-xs font-bold uppercase tracking-widest" onClick={() => {setGatewayMode(false); setOtpMode(false);}}>Cancel Transaction</Button>
                    </div>
                  ) : (
                  <RadioGroup 
                    value={paymentMethod} 
                    onValueChange={(val) => {
                      const method = val as 'Card' | 'UPI' | 'COD';
                      setPaymentMethod(method);
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
                  )}

                  <div className="space-y-6 pt-6 border-t">
                    {paymentMethod === 'UPI' && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                        {paymentStatus === 'awaiting_bank' && !isMobile ? (
                          <div className="p-8 bg-accent/5 rounded-[2.5rem] border-2 border-accent/20 space-y-8 text-center relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-4">
                                <div className="text-2xl font-black text-accent/20">0{Math.floor(timer/60)}:{String(timer%60).padStart(2, '0')}</div>
                             </div>
                             
                             <div className="space-y-4">
                               <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-xl border-4 border-accent/10">
                                 <Smartphone className="h-10 w-10 text-accent animate-bounce" />
                               </div>
                               <h3 className="text-2xl font-headline font-bold text-primary">Approve on {upiApp ? UPI_APPS.find(a => a.id === upiApp)?.name : 'UPI App'}</h3>
                               <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                 We've sent a payment request to <b>{formData.upiId}</b>. Open your UPI app and approve the request to complete your order.
                               </p>
                             </div>

                             <div className="space-y-4">
                               <div className="flex items-center justify-center gap-3 p-4 bg-white/50 rounded-2xl border border-accent/10 text-xs font-bold uppercase tracking-widest text-primary">
                                 <Info className="h-4 w-4 text-accent" />
                                 ₹{total.toLocaleString('en-IN')} request expires in {Math.floor(timer/60)}m {timer%60}s
                               </div>
                               <Button 
                                 className="w-full h-16 text-xl font-bold bg-accent hover:bg-accent/90 text-accent-foreground rounded-2xl shadow-2xl transition-all hover:scale-[1.02] active:scale-95"
                                 onClick={async () => {
                                   setIsProcessing(true);
                                   setPaymentStatus('verifying'); // "Checking with Bank..."
                                   await new Promise(r => setTimeout(r, 2500));
                                   
                                   setPaymentStatus('request_processing'); // "Extracting ₹X via NPCI..."
                                   await new Promise(r => setTimeout(r, 2000));
                                   
                                   setPaymentStatus('admin_verification'); // "Settling instantly with Admin..."
                                   await new Promise(r => setTimeout(r, 2000));
                                   
                                   finalizeOrder();
                                 }}
                               >
                                 I have successfully paid
                               </Button>
                               <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest cursor-pointer hover:text-accent transition-colors" onClick={() => setPaymentStatus('idle')}>
                                 Change Payment Method
                               </p>
                             </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <div className="space-y-6">
                              <div className="space-y-2">
                                <Label htmlFor="upiId" className={cn("font-bold text-xs uppercase tracking-widest text-muted-foreground", formData.upiId && !isUpiValid(formData.upiId) && "text-destructive")}>
                                  Step 1: Enter your UPI ID
                                </Label>
                                <div className="relative">
                                  <Input 
                                    id="upiId" 
                                    placeholder="name@bank" 
                                    value={formData.upiId} 
                                    onChange={handleInputChange} 
                                    className={cn(
                                      "h-14 rounded-xl text-lg font-medium pr-24",
                                      formData.upiId && !isUpiValid(formData.upiId) ? "border-destructive" : "focus:border-accent"
                                    )}
                                    disabled={isProcessing}
                                  />
                                  {isUpiValid(formData.upiId) && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full animate-in fade-in zoom-in">
                                      <CheckCircle className="h-3 w-3" /> VERIFIED
                                    </div>
                                  )}
                                </div>
                              </div>

                              {isUpiValid(formData.upiId) && (
                                <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    Step 2: Choose your UPI App
                                  </Label>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {UPI_APPS.map((app) => (
                                      <Button
                                        key={app.id}
                                        variant="outline"
                                        className={cn(
                                          "flex flex-col items-center justify-center p-4 h-24 rounded-2xl border-2 transition-all hover:border-accent hover:bg-accent/5",
                                          upiApp === app.id ? "border-accent bg-accent/10" : "border-muted"
                                        )}
                                        onClick={() => {
                                          setUpiApp(app.id);
                                          if (isMobile) handleCompleteOrder(app.id);
                                        }}
                                        disabled={isProcessing}
                                      >
                                        <div style={{ color: app.color }} className="mb-2">
                                          {app.icon}
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider">{app.name}</span>
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="p-4 bg-muted/30 rounded-2xl border space-y-3">
                                <div className="flex items-start gap-3">
                                  <ShieldCheck className="h-5 w-5 text-accent shrink-0" />
                                  <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-wider text-primary">Merchant Details (Admin)</p>
                                    <div className="space-y-1">
                                      <p className="text-sm font-medium"><span className="text-muted-foreground mr-1">Merchant:</span> {storeSettings.ownerName}</p>
                                      <p className="text-sm font-medium"><span className="text-muted-foreground mr-1">UPI ID:</span> {storeSettings.upiId}</p>
                                      <p className="text-sm font-medium"><span className="text-muted-foreground mr-1">Amount:</span> ₹{total.toLocaleString('en-IN')}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-[2.5rem] border-2 border-dashed border-accent/20 shadow-xl relative group">
                              <div className="relative w-56 h-56 mb-4 overflow-hidden rounded-2xl border-4 border-white shadow-lg bg-white p-2 flex items-center justify-center">
                                <img 
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(upiIntentUrl)}`}
                                  alt="Payment QR Code"
                                  className="max-w-full max-h-full object-contain"
                                />
                              </div>
                              <div className="flex items-center gap-2 text-accent font-bold">
                                <QrCode className="h-5 w-5" />
                                <span className="text-[10px] uppercase tracking-widest font-black">Scan to Pay Instantly</span>
                              </div>
                              <p className="text-[9px] text-muted-foreground mt-3 text-center uppercase tracking-tighter">
                                {isMobile ? "Direct redirect initiated" : "Or use Another Device flow via ID"}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {paymentMethod === 'Card' && !gatewayMode && !isRedirecting && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="cardNumber" className={cn("text-xs font-bold uppercase tracking-widest text-muted-foreground", formData.cardNumber && !isCardNumberValid(formData.cardNumber) && "text-destructive")}>
                                  Card Number
                                </Label>
                                <div className="relative group">
                                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                                  <Input 
                                    id="cardNumber" 
                                    placeholder="0000 0000 0000 0000" 
                                    value={formData.cardNumber} 
                                    onChange={(e) => {
                                      const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
                                      setFormData(prev => ({ ...prev, cardNumber: val }));
                                    }} 
                                    className={cn(
                                      "pl-12 h-14 rounded-2xl text-lg tracking-[0.2em] font-mono border-2",
                                      formData.cardNumber && !isCardNumberValid(formData.cardNumber) ? "border-destructive bg-red-50" : "focus:border-accent"
                                    )}
                                    disabled={isProcessing}
                                  />
                                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    {formData.cardNumber.startsWith('4') && <div className="text-[10px] font-black italic text-blue-600">VISA</div>}
                                    {formData.cardNumber.startsWith('5') && <div className="text-[10px] font-black italic text-orange-600">MASTERCARD</div>}
                                    {formData.cardNumber.startsWith('6') && <div className="text-[10px] font-black italic text-green-600">RUPAY</div>}
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="cardName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cardholder Name</Label>
                                <Input 
                                  id="cardName" 
                                  placeholder="NAME ON CARD" 
                                  value={formData.cardName} 
                                  onChange={handleInputChange} 
                                  className="h-14 rounded-2xl text-lg uppercase font-bold border-2 focus:border-accent"
                                  disabled={isProcessing}
                                />
                              </div>
                           </div>

                           <div className="bg-muted/10 p-8 rounded-[2rem] border-2 border-dashed border-primary/5 space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="expiry" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Expiry Date</Label>
                                  <Input 
                                    id="expiry" 
                                    placeholder="MM/YY" 
                                    value={formData.expiry} 
                                    onChange={(e) => {
                                      const val = e.target.value.replace(/\D/g, '').replace(/(.{2})/, '$1/').slice(0, 5);
                                      setFormData(prev => ({ ...prev, expiry: val }));
                                    }} 
                                    className="h-14 rounded-2xl text-center text-lg font-bold border-2 focus:border-accent" 
                                    disabled={isProcessing} 
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="cvc" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">CVV / CVC</Label>
                                  <Input 
                                    id="cvc" 
                                    type="password"
                                    placeholder="•••" 
                                    maxLength={3}
                                    value={formData.cvc} 
                                    onChange={(e) => {
                                      const val = e.target.value.replace(/\D/g, '');
                                      setFormData(prev => ({ ...prev, cvc: val }));
                                    }} 
                                    className="h-14 rounded-2xl text-center text-lg font-bold border-2 focus:border-accent tracking-widest" 
                                    disabled={isProcessing} 
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <ShieldCheck className="h-5 w-5 text-accent" />
                                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest leading-tight">
                                  Your card details are encrypted and never stored. 
                                  Safe & Secure Payment via PCI-DSS standards.
                                </p>
                              </div>
                           </div>
                        </div>

                        <div className="p-5 bg-primary/5 rounded-2xl border flex items-center gap-4">
                          <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-md bg-white border flex items-center justify-center text-[7px] font-black">VISA</div>
                            <div className="w-8 h-8 rounded-md bg-white border flex items-center justify-center text-[7px] font-black">MC</div>
                            <div className="w-8 h-8 rounded-md bg-white border flex items-center justify-center text-[7px] font-black">RUP</div>
                          </div>
                          <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Supports all major credit & debit cards</p>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'COD' && (
                      <div className="p-10 bg-muted/20 rounded-[2.5rem] border-2 border-dashed text-center animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                          <Banknote className="h-10 w-10 text-accent" />
                        </div>
                        <h3 className="text-xl font-headline font-bold text-primary">Cash on Delivery</h3>
                        <p className="text-sm text-muted-foreground mt-3 max-w-sm mx-auto">Pay Rs. {total.toLocaleString('en-IN')}/- in cash when your artisanal piece arrives.</p>
                      </div>
                    )}


                    {!gatewayMode && !isRedirecting && (
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
                            paymentMethod === 'UPI' ? 'Pay Now & Confirm' : 
                            paymentMethod === 'COD' ? 'Confirm Order' : 'Complete Purchase'
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                  </>
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
                      <p className="font-bold text-sm">Rs. {(item.price * item.quantity).toLocaleString('en-IN')}/-</p>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4 border-t border-white/10 pt-6">
                  <div className="flex justify-between text-sm text-primary-foreground/60">
                    <span>Subtotal</span>
                    <span className="font-bold">Rs. {subtotal.toLocaleString('en-IN')}/-</span>
                  </div>
                  <div className="flex justify-between text-sm text-primary-foreground/60">
                    <span>Shipping</span>
                    <span className="text-accent font-bold">FREE</span>
                  </div>
                  <div className="flex justify-between text-2xl font-bold pt-4 border-t border-white/20 text-white">
                    <span>Total</span>
                    <span>Rs. {total.toLocaleString('en-IN')}/-</span>
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
