
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ShoppingCart, 
  Search, 
  User, 
  Menu, 
  X, 
  LogOut, 
  LogIn, 
  Info, 
  Moon, 
  Sun, 
  ChevronDown, 
  ShoppingBag,
  Clock,
  Watch,
  Image as ImageIcon,
  AlarmClock,
  Home,
  Heart,
  Package,
  Truck,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/app/lib/store";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function Navbar() {
  const { cart, favorites, userName, userPhoto, isAdmin, isDelivery, storeSettings, logout } = useStore();
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const favCount = favorites.length;
  const router = useRouter();

  // Smart display label: if userName is an email, show the part before @
  const displayLabel = userName.includes('@') ? userName.split('@')[0] : userName;

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLogout = () => {
    logout();
    toast({ title: "Logged Out", description: "You have been logged out successfully." });
    window.location.href = "/login";
  };

  const ShoppingOptions = [
    { name: "Wall Clock", icon: Clock, href: "/#collection" },
    { name: "Alarm Clock", icon: AlarmClock, href: "/#collection" },
    { name: "Hand Watch", icon: Watch, href: "/#collection" },
    { name: "Photo Frame", icon: ImageIcon, href: "/#collection" },
  ];

  const NavLinks = () => {
    if (isDelivery) {
      return (
        <div className="flex items-center gap-10">
          <Link href="/about" className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary/70 hover:text-accent transition-all">About</Link>
          <Link href="/help" className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary/70 hover:text-accent transition-all">Help Centre</Link>
          <Link href="/delivery" className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent hover:text-accent/80 transition-all">Logistics Portal</Link>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-8">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-primary hover:text-accent transition-all outline-none">
              Shopping
              <ChevronDown className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 p-2 rounded-2xl shadow-2xl border-none glass-card">
            {ShoppingOptions.map((opt) => (
              <DropdownMenuItem key={opt.name} asChild>
                <Link href={opt.href} className="flex items-center gap-4 p-4 cursor-pointer rounded-xl hover:bg-accent/10 hover:text-accent transition-all">
                  <opt.icon className="h-4 w-4" />
                  <span className="font-bold text-[10px] uppercase tracking-widest">{opt.name}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Link href="/about" className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary hover:text-accent transition-all">About Us</Link>
        <Link href="/help" className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary hover:text-accent transition-all">Help Centre</Link>
        {userName !== "Guest" && (
          <Link href="/orders" className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary hover:text-accent transition-all">Order History</Link>
        )}
        {isAdmin && (
          <Link href="/admin" className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent hover:text-accent/80 transition-all border-b border-accent/30 pb-0.5">Admin Dashboard</Link>
        )}
      </div>
    );
  };

  if (theme === null) return null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
      <div className="wide-container h-24 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-6 group">
            <div className="relative h-14 w-36 transition-transform duration-500 group-hover:scale-105">
              <Image 
                src={storeSettings.logoUrl}
                alt={storeSettings.name}
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-[11px] font-bold text-accent uppercase tracking-[0.4em] hidden xl:block mt-1 border-l border-primary/10 pl-6">
              since 1986
            </span>
          </Link>
          <div className="hidden lg:flex items-center">
            <NavLinks />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full h-12 w-12 hover:bg-accent/10 hover:text-accent transition-all"
            onClick={toggleTheme}
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>



          <div className="h-8 w-px bg-primary/10 hidden sm:block mx-2" />

          {userName === "Guest" ? (
            <Link href="/login" className="hidden sm:block">
              <Button variant="outline" className="h-12 px-8 rounded-full border-2 border-accent text-accent hover:bg-accent hover:text-white font-bold text-[11px] uppercase tracking-widest transition-all">
                Login
              </Button>
            </Link>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/profile">
                <Button variant="ghost" className="flex items-center gap-3 h-12 px-2 pl-2 pr-5 rounded-full bg-accent/10 text-accent font-bold group">
                  <Avatar className="h-9 w-9 border-2 border-white/50 group-hover:scale-105 transition-transform">
                    <AvatarImage src={userPhoto} alt={userName} />
                    <AvatarFallback className="bg-accent text-accent-foreground font-headline">
                      {displayLabel[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[11px] uppercase tracking-widest truncate max-w-[100px]">{displayLabel}</span>
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-10 px-4 rounded-full border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold text-[10px] uppercase tracking-widest transition-all"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
          
          {!isDelivery && (
            <Link href="/favorites">
              <Button variant="ghost" size="icon" className="relative rounded-full h-12 w-12 hover:bg-accent/10 transition-all">
                <Heart className={`h-5 w-5 ${favCount > 0 ? "fill-red-500 text-red-500" : ""}`} />
                {favCount > 0 && (
                  <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg animate-in zoom-in">
                    {favCount}
                  </span>
                )}
              </Button>
            </Link>
          )}

          {!isDelivery && (
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative rounded-full h-12 w-12 hover:bg-accent/10 transition-all">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground shadow-lg animate-in zoom-in">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          )}
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden rounded-full h-12 w-12 hover:bg-accent/10">
                <Menu className="h-6 w-6 text-primary" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] p-0 border-none glass-card">
              <div className="flex flex-col h-full">
                <SheetHeader className="p-8 border-b">
                  <SheetTitle className="text-left flex flex-col gap-2">
                    <div className="relative h-10 w-28">
                      <Image src={storeSettings.logoUrl} alt={storeSettings.name} fill className="object-contain object-left" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/30">Est. 1986</span>
                  </SheetTitle>
                </SheetHeader>
                
                <div className="flex-1 overflow-y-auto p-4">
                  <nav className="flex flex-col gap-2">
                    {isDelivery ? (
                      <>
                        <Link href="/about" className="flex items-center gap-4 p-5 rounded-2xl hover:bg-accent/10 transition-all font-bold text-sm text-primary group">
                          <Info className="h-5 w-5 text-accent group-hover:scale-110 transition-transform" />
                          About The Studio
                        </Link>

                        <Link href="/help" className="flex items-center gap-4 p-5 rounded-2xl hover:bg-accent/10 transition-all font-bold text-sm text-primary group">
                          <HelpCircle className="h-5 w-5 text-accent group-hover:scale-110 transition-transform" />
                          Help Centre
                        </Link>
                        <Link href="/delivery" className="flex items-center gap-4 p-5 rounded-2xl bg-accent/5 border border-accent/10 text-accent transition-all font-bold text-sm group">
                          <Truck className="h-5 w-5 group-hover:scale-110 transition-transform" />
                          Logistics Portal
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link href="/" className="flex items-center gap-4 p-5 rounded-2xl hover:bg-accent/10 transition-all font-bold text-sm text-primary group">
                          <Home className="h-5 w-5 text-accent group-hover:scale-110 transition-transform" />
                          Home
                        </Link>

                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="shopping" className="border-none">
                            <AccordionTrigger className="hover:no-underline py-5 px-5 rounded-2xl hover:bg-accent/10 font-bold text-sm text-primary">
                              <div className="flex items-center gap-4">
                                <ShoppingBag className="h-5 w-5 text-accent" />
                                Explore Collection
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="flex flex-col gap-1 pl-14 pb-4">
                              {ShoppingOptions.map((opt) => (
                                <Link 
                                  key={opt.name} 
                                  href={opt.href} 
                                  className="flex items-center gap-3 p-4 rounded-xl hover:bg-muted transition-all font-bold text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary"
                                >
                                  <opt.icon className="h-4 w-4" />
                                  {opt.name}
                                </Link>
                              ))}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>

                        <Link href="/about" className="flex items-center gap-4 p-5 rounded-2xl hover:bg-accent/10 transition-all font-bold text-sm text-primary group">
                          <Info className="h-5 w-5 text-accent group-hover:scale-110 transition-transform" />
                          About The Studio
                        </Link>

                        <Link href="/help" className="flex items-center gap-4 p-5 rounded-2xl hover:bg-accent/10 transition-all font-bold text-sm text-primary group">
                          <HelpCircle className="h-5 w-5 text-accent group-hover:scale-110 transition-transform" />
                          Help Centre
                        </Link>

                        {userName !== "Guest" && (
                          <Link href="/orders" className="flex items-center gap-4 p-5 rounded-2xl hover:bg-accent/10 transition-all font-bold text-sm text-primary group">
                            <Package className="h-5 w-5 text-accent group-hover:scale-110 transition-transform" />
                            Order History
                          </Link>
                        )}

                        {isAdmin && (
                          <Link href="/admin" className="flex items-center gap-4 p-5 rounded-2xl bg-accent/5 border border-accent/10 text-accent transition-all font-bold text-sm group">
                            <ShoppingBag className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            Management Hub
                          </Link>
                        )}

                        {!isAdmin && userName !== "Guest" && (
                          <button 
                            onClick={handleLogout}
                            className="flex items-center gap-4 p-5 rounded-2xl hover:bg-red-50 text-red-500 transition-all font-bold text-sm group w-full text-left"
                          >
                            <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            Sign Out Session
                          </button>
                        )}
                      </>
                    )}
                  </nav>
                </div>

                <div className="p-8 border-t bg-muted/20">
                  {isDelivery ? (
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-4 p-5 h-auto rounded-2xl text-red-500 hover:text-red-600 hover:bg-red-50 font-bold"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-5 w-5" />
                      Sign Out
                    </Button>
                  ) : userName === "Guest" ? (
                    <Link href="/login">
                      <Button className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-sm uppercase tracking-widest shadow-xl">
                        <LogIn className="mr-3 h-5 w-5" />
                        Sign In
                      </Button>
                    </Link>
                  ) : (
                    <div className="space-y-4">
                      <Link href="/profile" className="flex items-center gap-4 p-4 rounded-2xl bg-white border-2 border-accent/10 shadow-sm group">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-md transition-transform group-hover:scale-105">
                          <AvatarImage src={userPhoto} alt={userName} />
                          <AvatarFallback className="bg-accent text-accent-foreground">{displayLabel[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-primary truncate">{displayLabel}</span>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Collector Profile</span>
                        </div>
                      </Link>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-4 p-5 h-auto rounded-2xl text-red-500 hover:text-red-600 hover:bg-red-50 font-bold"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-5 w-5" />
                        Log Out Session
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
