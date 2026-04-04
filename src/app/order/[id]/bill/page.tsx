
"use client";

import { use, useEffect, useState } from "react";
import { useStore } from "@/app/lib/store";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Download, ShoppingBag, CreditCard, Banknote, Wallet } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

export default function OrderBillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { orders, storeSettings } = useStore();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const found = orders.find(o => o.id === id);
    if (found) setOrder(found);
  }, [orders, id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const originalTitle = document.title;
    document.title = `VWood-Bill-${order.id}`;
    toast({
      title: "Saving Bill as PDF",
      description: "In the print dialog, choose 'Save as PDF' to download your bill.",
    });
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.title = originalTitle;
      }, 1000);
    }, 300);
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-24 text-center">
          <p className="text-muted-foreground">Order not found.</p>
          <Button asChild className="mt-4">
            <Link href="/profile">Back to Profile</Link>
          </Button>
        </main>
      </div>
    );
  }

  const subtotal = order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  const shipping = order.total - subtotal;

  const getPaymentIcon = (method: string) => {
    switch(method) {
      case 'Card': return <CreditCard className="h-4 w-4" />;
      case 'UPI': return <Wallet className="h-4 w-4" />;
      case 'COD': return <Banknote className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col print:bg-white">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-16 max-w-4xl">
        <div className="flex items-center justify-between mb-8 print:hidden">
          <Link href="/profile" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-accent transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Link>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={handlePrint} className="rounded-full">
              <Printer className="mr-2 h-4 w-4" />
              Print Bill
            </Button>
            <Button
              size="sm"
              className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-lg shadow-accent/20 gap-2"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
              Download Bill
            </Button>
          </div>
        </div>

        <Card className="border-none shadow-2xl overflow-hidden bg-white print:shadow-none print:border-none">
          <CardContent className="p-8 md:p-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12 border-b pb-12">
              <div className="space-y-4">
                <div className="relative h-20 w-48">
                  <Image 
                    src={storeSettings.logoUrl} 
                    alt={storeSettings.name} 
                    fill 
                    className="object-contain object-left"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-headline font-bold text-primary">{storeSettings.name}</h1>
                  <p className="text-sm text-muted-foreground max-w-xs">{storeSettings.address}</p>
                  <p className="text-sm text-muted-foreground">{storeSettings.email} | {storeSettings.phone}</p>
                </div>
              </div>
              <div className="text-left md:text-right space-y-1">
                <h2 className="text-4xl font-headline font-bold text-primary mb-4">INVOICE</h2>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Order Number</p>
                <p className="text-lg font-bold text-accent">{order.id}</p>
                <div className="pt-4">
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Date Issued</p>
                  <p className="text-sm font-medium">{order.date}</p>
                </div>
              </div>
            </div>

            {/* Billing Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Bill To:</h3>
                <p className="text-xl font-bold text-primary mb-2">{order.customerName}</p>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {order.customerAddress}
                </p>
              </div>
              <div className="md:text-right">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Payment Info:</h3>
                <div className="flex flex-col md:items-end gap-2">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    {getPaymentIcon(order.paymentMethod)}
                    <span>{order.paymentMethod}</span>
                  </div>
                  <p className="text-xs text-muted-foreground italic">Transaction processed locally</p>
                  <div className="inline-block mt-4 px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-bold">
                    Status: {order.status === 'Processing' ? 'Accepted' : order.status}
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="mb-12 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-primary/10 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <th className="py-4 px-2">Description</th>
                    <th className="py-4 px-2 text-center">Qty</th>
                    <th className="py-4 px-2 text-right">Price</th>
                    <th className="py-4 px-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.items.map((item: any, i: number) => (
                    <tr key={i} className="text-sm">
                      <td className="py-6 px-2">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded border bg-muted shrink-0 overflow-hidden print:hidden">
                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <p className="font-bold text-primary">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.style} Timepiece</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-2 text-center font-medium">{item.quantity}</td>
                      <td className="py-6 px-2 text-right font-medium">Rs. {item.price.toLocaleString('en-IN')}/-</td>
                      <td className="py-6 px-2 text-right font-bold text-primary">Rs. {(item.price * item.quantity).toLocaleString('en-IN')}/-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="flex flex-col items-end">
              <div className="w-full md:w-80 space-y-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium">Rs. {subtotal.toLocaleString('en-IN')}/-</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping & Handling</span>
                  <span className="font-medium">{shipping === 0 ? "FREE" : `Rs. ${shipping.toLocaleString('en-IN')}/-`}</span>
                </div>
                <div className="pt-4 border-t-2 border-primary/10 flex justify-between items-center">
                  <span className="text-lg font-headline font-bold text-primary">Total Paid</span>
                  <span className="text-2xl font-bold text-accent">Rs. {order.total.toLocaleString('en-IN')}/-</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-12 border-t text-center space-y-6">
              <div className="flex flex-col items-center gap-3">
                <div className="relative h-24 w-24 transition-transform hover:scale-110 duration-500">
                  <Image 
                    src="/v-wood-seal.png" 
                    alt="Official Artisanal Seal" 
                    fill 
                    className="object-contain drop-shadow-xl" 
                  />
                </div>
                <div className="text-center">
                  <p className="text-[9px] font-bold text-accent uppercase tracking-[0.4em]">Official Studio Seal</p>
                  <p className="text-[7px] text-muted-foreground font-bold uppercase tracking-widest mt-1 italic">V-WOOD QUARTZ • MORBI HUB</p>
                </div>
              </div>
              <h4 className="font-headline font-bold text-primary text-xl">Thank you for choosing V-WOOD QUARTZ</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed italic">
                This digital receipt preserves the record of your handcrafted timepiece. For artisanal support or inquiries regarding your collection, contact us at {storeSettings.email}.
              </p>
            </div>
          </CardContent>
        </Card>


        <div className="mt-12 text-center print:hidden">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Nature's Time, Handcrafted For You.</p>
        </div>
      </main>
    </div>
  );
}
