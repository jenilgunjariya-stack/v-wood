
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/app/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { LogIn, Mail, Lock, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, setUserName, setUserPhoto, storeSettings } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "Please enter your email address to continue.",
      });
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address (e.g. john@example.com).",
      });
      return;
    }

    // Check for role-based security pins
    const isAdmin = password === "261106";
    const isDelivery = password === "12345";

    // Use email as the unique user identifier
    login(trimmedEmail, isAdmin, isDelivery).then(() => {
      if (isAdmin) {
        toast({
          title: "Admin Access Granted",
          description: `Welcome back. Dashboard access enabled.`,
        });
        router.push("/admin");
      } else if (isDelivery) {
        toast({
          title: "Logistics Access Granted",
          description: `Welcome back. Fulfillment dashboard ready.`,
        });
        router.push("/delivery");
      } else {
        toast({
          title: "Welcome!",
          description: `Successfully signed in as ${trimmedEmail}.`,
        });
        // Redirect to original destination (e.g. /checkout) or home
        router.push(redirectTo);
      }
    });
  };

  const handleGoogleLogin = async () => {
    if (!auth || !googleProvider) {
      toast({
        variant: "destructive",
        title: "Google Login Unavailable",
        description: "Please configure Firebase environment variables to enable Google authentication.",
      });
      return;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      if (user.email) {
        // Use email as the unique user identifier - WAIT for it to finish sync
        await login(user.email, false, false);
        
        // Sync profile details IF they are missing from the server-fetched profile
        // We check current state after login finishes
        if (user.displayName) setUserName(user.displayName);
        if (user.photoURL) setUserPhoto(user.photoURL);
        
        toast({
          title: "Welcome!",
          description: `Successfully signed in as ${user.displayName || user.email}.`,
        });
        
        // Redirect to original destination (e.g. /checkout) or home
        router.push(redirectTo);
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      
      // Provide more helpful error for common issues
      let errorMessage = "Failed to sign in with Google.";
      if (error.code === 'auth/configuration-not-found') {
        errorMessage = "Google login is not configured. Please set up Firebase environment variables.";
      }

      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || errorMessage,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://picsum.photos/seed/wood-texture-dark/1920/1080"
          alt="Background"
          fill
          className="object-cover opacity-20 grayscale"
          data-ai-hint="dark wood"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background" />
      </div>

      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="flex flex-col items-center mb-10">
            <div className="relative h-24 w-60 mb-4 drop-shadow-2xl">
              <img
                src={storeSettings.logoUrl}
                alt={storeSettings.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="h-1 w-20 bg-accent rounded-full" />
          </div>

          <Card className="border-none shadow-[0_32px_64px_-15px_rgba(0,0,0,0.3)] bg-white/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden ring-1 ring-white/20">
            <CardHeader className="bg-primary text-primary-foreground p-10 text-center relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-accent/30 rounded-full" />
              <CardTitle className="font-headline text-4xl font-bold tracking-tight">Sign In</CardTitle>
              <CardDescription className="text-primary-foreground/70 mt-3 font-body text-base">
                Step into the world of artisanal time.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-10">
              <form onSubmit={handleLogin} className="space-y-8">
                {/* Email Field */}
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="yourname@example.com"
                      className="pl-12 h-14 rounded-2xl border-2 bg-white/50 focus:border-accent focus:bg-white transition-all text-lg shadow-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password / PIN Field */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between ml-1">
                    <Label htmlFor="password" className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      Security PIN
                    </Label>
                    <span className="text-[10px] font-bold text-accent/60 uppercase tracking-widest flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      Admin only
                    </span>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Leave blank for customer access"
                      className="pl-12 pr-12 h-14 rounded-2xl border-2 bg-white/50 focus:border-accent focus:bg-white transition-all text-lg shadow-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground ml-1">
                    Customers: leave PIN blank. Admins enter the studio PIN.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-16 text-xl font-bold bg-accent hover:bg-accent/90 text-accent-foreground rounded-[1.25rem] group shadow-xl shadow-accent/20 transition-all active:scale-[0.98]"
                >
                  Continue to Store
                  <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2" />
                </Button>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-4 text-muted-foreground font-bold tracking-widest rounded-full">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  className="w-full h-16 text-lg font-bold border-2 rounded-[1.25rem] hover:bg-muted/50 transition-all flex items-center justify-center gap-3 active:scale-[0.98] border-muted/20"
                >
                  <svg className="h-6 w-6" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Sign in with Google
                </Button>
              </form>
            </CardContent>

            <CardFooter className="bg-muted/30 p-8 text-center border-t border-muted/50">
              <div className="w-full space-y-2">
                <p className="text-xs text-muted-foreground font-medium">
                  Experience nature's rhythm with {storeSettings.name}
                </p>
                <div className="flex items-center justify-center gap-4 pt-2">
                  <div className="h-px w-8 bg-muted" />
                  <div className="w-2 h-2 rounded-full bg-accent/30" />
                  <div className="h-px w-8 bg-muted" />
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
