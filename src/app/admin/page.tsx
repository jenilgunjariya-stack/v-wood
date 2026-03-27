"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { useStore, StoreSettings } from "@/app/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle, Edit, Trash2, Settings, Package, Image as ImageIcon, Save, RefreshCw, User as UserIcon, LogOut, Lock, ShoppingBag, Truck, CheckCircle, MapPin, User, CreditCard, Banknote, Wallet, Box, Users, HandCoins, CheckCircle2, Pencil, Calendar, ChevronLeft, ChevronRight, RotateCcw, X, DollarSign, QrCode, Globe, Smartphone, Clock, AlertTriangle, FileBarChart2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock as ClockType, Order, Employee } from "@/app/lib/types";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function AdminPage() {
  const { products, updateProducts, storeSettings, setStoreSettings, logout, isAdmin, userName, userPhoto, orders, updateOrderStatus, employees, addEmployee, updateEmployee, removeEmployee, payAllEmployees, updateAttendance, updateEmployeeStatus, resetPayroll } = useStore();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'employees' | 'settings'>('products');
  const [empSubTab, setEmpSubTab] = useState<'list' | 'attendance' | 'report'>('list');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddEmpOpen, setIsAddEmpOpen] = useState(false);
  const [isEditEmpOpen, setIsEditEmpOpen] = useState(false);
  
  const [mounted, setMounted] = useState(false);
  const [payrollDate, setPayrollDate] = useState<Date>(new Date());
  const [todayKey, setTodayKey] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    setTodayKey(new Date().toISOString().split('T')[0]);
  }, []);
  
  const [newClock, setNewClock] = useState<Partial<ClockType>>({
    name: "",
    price: 0,
    description: "",
    style: "Modern",
    imageUrl: "",
    specifications: ["Battery Powered", "Quartz Movement"],
    stock: 0
  });

  const [newEmp, setNewEmp] = useState<Partial<Employee>>({
    name: "",
    salary: 0,
    role: "",
    paymentStatus: "Pending"
  });

  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [editingClock, setEditingClock] = useState<ClockType | null>(null);
  const [tempSettings, setTempSettings] = useState<StoreSettings>(storeSettings);

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(payrollDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setPayrollDate(newDate);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Array(new Date(year, month + 1, 0).getDate()).fill(0).map((_, i) => i + 1);
  };

  const days = getDaysInMonth(payrollDate);

  const router = useRouter();

  if (!isAdmin) {
    if (!mounted) return null;
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-none shadow-2xl text-center p-8 space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 text-red-600 mb-4">
              <Lock className="h-10 w-10" />
            </div>
            <h1 className="text-3xl font-headline font-bold text-primary">Access Restricted</h1>
            <p className="text-muted-foreground">This area is reserved for store administrators. Please sign in with an authorized account to access management tools.</p>
            <Button asChild className="w-full h-12 bg-primary text-white font-bold rounded-xl" size="lg">
              <Link href="/login">Go to Login</Link>
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this product?")) {
      updateProducts(products.filter(p => p.id !== id));
      toast({ title: "Product Deleted", description: "The product has been removed from the catalog." });
    }
  };

  const handleAddEmp = () => {
    const emp = {
      ...newEmp,
      id: `emp-${Date.now()}`,
      attendance: {}
    } as Employee;
    addEmployee(emp);
    setIsAddEmpOpen(false);
    setNewEmp({ name: "", salary: 0, role: "", paymentStatus: "Pending" });
    toast({ title: "Employee Added", description: `${emp.name} has been added to the registry.` });
  };

  const handleUpdateEmp = () => {
    if (editingEmp) {
      updateEmployee(editingEmp);
      setIsEditEmpOpen(false);
      setEditingEmp(null);
      toast({ title: "Employee Updated", description: "The record has been updated successfully." });
    }
  };

  const handleToggleStatus = (emp: Employee) => {
    const newStatus = emp.paymentStatus === 'Paid' ? 'Pending' : 'Paid';
    updateEmployeeStatus(emp.id, newStatus);
    toast({ 
      title: "Status Updated", 
      description: `${emp.name} is now marked as ${newStatus}.` 
    });
  };

  const handlePaySalary = (empId: string) => {
    updateEmployeeStatus(empId, 'Paid');
    toast({ title: "Salary Paid", description: "Payment status updated to Paid." });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ variant: "destructive", title: "Image too large", description: "Please upload a photo under 2MB for optimal performance." });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (isEditing && editingClock) {
          setEditingClock({ ...editingClock, imageUrl: base64String });
        } else {
          setNewClock({ ...newClock, imageUrl: base64String });
        }
        toast({ title: "Image Uploaded", description: "Product photo successfully attached to the registry." });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePayAll = () => {
    if (confirm(`Disburse salaries to all ${pendingSalariesCount} pending employees for ${formatMonthYear(payrollDate)}?`)) {
      payAllEmployees();
      toast({ title: "Salaries Disbursed", description: "All pending employees have been marked as Paid." });
    }
  };

  const handleAdd = () => {
    const descriptiveId = newClock.name?.toLowerCase().replace(/\s+/g, '-') || `clock-${Date.now()}`;
    const clock = {
      ...newClock,
      id: descriptiveId,
      imageUrl: newClock.imageUrl || `https://picsum.photos/seed/new-clock-${descriptiveId}/600/600`,
      stock: newClock.stock || 0
    } as ClockType;
    
    updateProducts([...products, clock]);
    setIsAddOpen(false);
    setNewClock({ name: "", price: 0, description: "", style: "Modern", imageUrl: "", specifications: ["Battery Powered", "Quartz Movement"], stock: 0 });
    toast({ title: "Product Added", description: "New timepiece successfully listed." });
  };

  const handleLogout = () => {
    logout();
    toast({ title: "Logged Out", description: "Session ended successfully." });
    router.push("/login");
  };

  const outOfStockCount = products.filter(p => p.stock <= 0).length;
  const pendingSalariesCount = employees.filter(e => e.paymentStatus === 'Pending').length;
  const pendingVerificationCount = orders.filter(o => o.status === 'Awaiting Verification').length;

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row wide-container py-8">
        <aside className="w-full md:w-80 bg-primary text-primary-foreground p-10 rounded-[3rem] flex flex-col shadow-2xl">
          <div className="relative h-24 w-full mb-10">
            <img 
              src={storeSettings.logoUrl}
              alt="Store Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="mb-10 border-b border-primary-foreground/10 pb-8 flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-accent/20 shrink-0">
              <AvatarImage src={userPhoto} alt={userName} />
              <AvatarFallback className="bg-white/10 text-white">
                <UserIcon className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent mb-1">Admin Profile</p>
              <h2 className="text-lg font-bold truncate">Welcome, {userName}</h2>
            </div>
          </div>

          <nav className="space-y-3 flex-1">
            <Button 
              variant="ghost" 
              className={cn(
                "w-full justify-start gap-4 h-14 rounded-2xl transition-all",
                activeTab === 'products' ? "bg-accent/20 text-accent font-bold" : "opacity-60"
              )}
              onClick={() => setActiveTab('products')}
            >
              <Package className="h-5 w-5" /> Products
            </Button>
            <Button 
              variant="ghost" 
              className={cn(
                "w-full justify-start gap-4 h-14 rounded-2xl transition-all",
                activeTab === 'orders' ? "bg-accent/20 text-accent font-bold" : "opacity-60"
              )}
              onClick={() => setActiveTab('orders')}
            >
              <ShoppingBag className="h-5 w-5" /> Orders
              {pendingVerificationCount > 0 && (
                <span className="ml-auto w-6 h-6 bg-accent text-accent-foreground text-[10px] flex items-center justify-center rounded-full font-bold animate-pulse shadow-lg shadow-accent/40">
                  {pendingVerificationCount}
                </span>
              )}
            </Button>
            <Button 
              variant="ghost" 
              className={cn(
                "w-full justify-start gap-4 h-14 rounded-2xl transition-all",
                activeTab === 'employees' ? "bg-accent/20 text-accent font-bold" : "opacity-60"
              )}
              onClick={() => setActiveTab('employees')}
            >
              <Users className="h-5 w-5" /> Employees
              {pendingSalariesCount > 0 && (
                <span className="ml-auto w-6 h-6 bg-accent text-accent-foreground text-[10px] flex items-center justify-center rounded-full font-bold">
                  {pendingSalariesCount}
                </span>
              )}
            </Button>
            <Button 
              variant="ghost" 
              className={cn(
                "w-full justify-start gap-4 h-14 rounded-2xl transition-all",
                activeTab === 'settings' ? "bg-accent/20 text-accent font-bold" : "opacity-60"
              )}
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="h-5 w-5" /> Settings
            </Button>
          </nav>

          <div className="pt-10 border-t border-primary-foreground/10">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-4 h-14 rounded-2xl text-red-400 hover:text-red-300 hover:bg-red-400/10 font-bold"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" /> Logout
            </Button>
          </div>
        </aside>

        <main className="flex-1 p-10 lg:pl-16">
          {activeTab === 'products' && (
            <div className="animate-in fade-in duration-500">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-16">
                <div>
                  <h1 className="text-5xl font-headline font-bold text-primary">Manage Catalog</h1>
                  <p className="text-muted-foreground mt-2 text-lg">Update your artisanal collection and stock levels.</p>
                </div>
                
                <div className="flex gap-4">
                  {outOfStockCount > 0 && (
                    <Button 
                      variant="destructive" 
                      onClick={() => {
                        if(confirm(`Remove all ${outOfStockCount} out of stock products?`)) {
                          updateProducts(products.filter(p => p.stock > 0));
                          toast({ title: "Cleanup Complete", description: "Out of stock items removed." });
                        }
                      }}
                      className="rounded-full h-14 px-8"
                    >
                      <Trash2 className="mr-3 h-5 w-5" />
                      Clean Inventory
                    </Button>
                  )}
                  <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold rounded-full h-14 px-8 shadow-xl transition-all hover:scale-105">
                        <PlusCircle className="mr-3 h-5 w-5" />
                        Add New Clock
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="font-headline text-3xl">List New Timepiece</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 pt-6">
                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-2">
                            <Label>Clock Name</Label>
                            <Input value={newClock.name} onChange={e => setNewClock({...newClock, name: e.target.value})} placeholder="Classic Gold" className="h-12" />
                          </div>
                          <div className="space-y-2">
                            <Label>Style / Category</Label>
                            <Select onValueChange={(val) => setNewClock({...newClock, style: val})}>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select Style" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Minimalist">Minimalist</SelectItem>
                                <SelectItem value="Mid-Century">Mid-Century</SelectItem>
                                <SelectItem value="Industrial">Industrial</SelectItem>
                                <SelectItem value="Vintage">Vintage</SelectItem>
                                <SelectItem value="Modern">Modern</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <Label>Price (₹)</Label>
                            <Input type="number" value={newClock.price} onChange={e => setNewClock({...newClock, price: parseInt(e.target.value)})} className="h-12" />
                          </div>
                          <div className="space-y-2">
                            <Label>Stock (Qty)</Label>
                            <Input type="number" value={newClock.stock} onChange={e => setNewClock({...newClock, stock: parseInt(e.target.value)})} className="h-12" />
                          </div>
                          <div className="space-y-2">
                            <Label>Shape</Label>
                            <Select onValueChange={(val) => setNewClock({...newClock, shape: val} as any)}>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Shape" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Round">Round</SelectItem>
                                <SelectItem value="Square">Square</SelectItem>
                                <SelectItem value="Rectangular">Rectangular</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-4 pt-2 border-t mt-4">
                          <Label className="text-accent font-bold uppercase tracking-widest text-[10px]">Artisanal Product Image</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            <div className="space-y-4">
                              <div className="flex flex-col gap-2">
                                <Label className="text-xs">Direct Device Upload</Label>
                                <div className="relative group p-6 border-2 border-dashed border-primary/20 rounded-2xl hover:border-accent hover:bg-accent/5 transition-all text-center">
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => handleImageUpload(e)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                  />
                                  <div className="space-y-2 pointer-events-none">
                                    <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto">
                                      <ImageIcon className="h-5 w-5" />
                                    </div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Upload Original Photo</p>
                                    <p className="text-[9px] text-muted-foreground">JPG, PNG or WEBP (Max 2MB)</p>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs">Remote Link / URL</Label>
                                <Input 
                                  value={newClock.imageUrl} 
                                  onChange={e => setNewClock({...newClock, imageUrl: e.target.value})} 
                                  placeholder="https://imgur.com/your-clock.jpg" 
                                  className="h-10"
                                />
                              </div>
                            </div>

                            <div className="w-full aspect-square bg-muted rounded-2xl overflow-hidden border-2 border-primary/10 flex items-center justify-center">
                              {newClock.imageUrl ? (
                                <img src={newClock.imageUrl} alt="Preview" className="w-full h-full object-contain" />
                              ) : (
                                <div className="text-center px-6">
                                  <ImageIcon className="h-8 w-8 text-primary/20 mx-auto mb-2" />
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/30">Photo Preview Area</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea value={newClock.description} onChange={e => setNewClock({...newClock, description: e.target.value})} className="min-h-[120px]" />
                        </div>
                        <Button className="w-full h-14 bg-accent text-accent-foreground font-bold text-lg rounded-2xl" onClick={handleAdd}>Confirm Listing</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border shadow-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-muted/50 border-b">
                    <tr className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                      <th className="px-8 py-6">Product</th>
                      <th className="px-8 py-6">Price</th>
                      <th className="px-8 py-6 text-center">Stock Status</th>
                      <th className="px-8 py-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-5">
                              <div className="h-16 w-16 rounded-[1.25rem] border overflow-hidden shrink-0 bg-muted p-1">
                                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover rounded-xl" />
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-primary text-lg block truncate">{p.name}</span>
                                <span className="text-[10px] uppercase font-bold text-accent tracking-widest">{p.style}</span>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6 font-bold text-primary text-lg">₹{p.price.toLocaleString('en-IN')}</td>
                        <td className="px-8 py-6 text-center">
                          <Badge 
                            variant={p.stock > 0 ? "outline" : "destructive"}
                            className={cn(
                              "h-8 px-4 rounded-full font-bold uppercase tracking-widest text-[10px]",
                              p.stock > 0 && "border-green-500 text-green-600 bg-green-50"
                            )}
                          >
                            {p.stock > 0 ? `${p.stock} Available` : "Sold Out"}
                          </Badge>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-3">
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground hover:text-accent" onClick={() => {
                              setEditingClock(p);
                              setIsEditOpen(true);
                            }}>
                              <Edit className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-destructive hover:bg-destructive/10" onClick={() => handleDelete(p.id)}>
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="font-headline text-3xl">Update Timepiece</DialogTitle>
                  </DialogHeader>
                  {editingClock && (
                    <div className="space-y-6 pt-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input value={editingClock.name} onChange={e => setEditingClock({...editingClock, name: e.target.value})} className="h-12" />
                        </div>
                        <div className="space-y-2">
                          <Label>Style / Category</Label>
                          <Input value={editingClock.style} onChange={e => setEditingClock({...editingClock, style: e.target.value})} className="h-12" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label>Price (₹)</Label>
                          <Input type="number" value={editingClock.price} onChange={e => setEditingClock({...editingClock, price: parseInt(e.target.value)})} className="h-12" />
                        </div>
                        <div className="space-y-2">
                          <Label>Stock Quantity</Label>
                          <Input type="number" value={editingClock.stock} onChange={e => setEditingClock({...editingClock, stock: parseInt(e.target.value)})} className="h-12" />
                        </div>
                        <div className="space-y-2">
                          <Label>Discount Price (₹)</Label>
                          <Input 
                            type="number" 
                            value={(editingClock as any).discountPrice || ""} 
                            onChange={e => setEditingClock({...editingClock, discountPrice: parseInt(e.target.value)} as any)} 
                            className="h-12"
                            placeholder="Optional"
                          />
                        </div>
                      </div>
                      <div className="space-y-4 pt-2 border-t mt-4">
                        <Label className="text-accent font-bold uppercase tracking-widest text-[10px]">Artisanal Product Image</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                          <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                              <Label className="text-xs">Direct Device Upload</Label>
                              <div className="relative group p-6 border-2 border-dashed border-primary/20 rounded-2xl hover:border-accent hover:bg-accent/5 transition-all text-center">
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={(e) => handleImageUpload(e, true)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="space-y-2 pointer-events-none">
                                  <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto">
                                    <ImageIcon className="h-5 w-5" />
                                  </div>
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Upload Original Photo</p>
                                  <p className="text-[9px] text-muted-foreground">JPG, PNG or WEBP (Max 2MB)</p>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">Remote Link / URL</Label>
                              <Input 
                                value={editingClock.imageUrl} 
                                onChange={e => setEditingClock({...editingClock, imageUrl: e.target.value})} 
                                placeholder="https://imgur.com/your-clock.jpg" 
                                className="h-10"
                              />
                            </div>
                          </div>

                          <div className="w-full aspect-square bg-muted rounded-2xl overflow-hidden border-2 border-primary/10 flex items-center justify-center">
                            {editingClock.imageUrl ? (
                              <img src={editingClock.imageUrl} alt="Preview" className="w-full h-full object-contain" />
                            ) : (
                              <div className="text-center px-6">
                                <ImageIcon className="h-8 w-8 text-primary/20 mx-auto mb-2" />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/30">Photo Preview Area</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea value={editingClock.description} onChange={e => setEditingClock({...editingClock, description: e.target.value})} className="min-h-[120px]" />
                      </div>
                      <Button className="w-full h-14 bg-accent text-accent-foreground font-bold text-lg rounded-2xl" onClick={() => {
                        updateProducts(products.map(p => p.id === editingClock.id ? editingClock : p));
                        setIsEditOpen(false);
                        toast({ title: "Product Updated", description: `${editingClock.name} details have been saved.` });
                      }}>
                        Update Details
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          )}

          {activeTab === 'employees' && (
            <div className="animate-in fade-in duration-500">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-16">
                <div className="space-y-4">
                  <div className="flex items-center gap-5">
                    <h1 className="text-5xl font-headline font-bold text-primary">Staff Hub</h1>
                    <div className="flex items-center gap-1 bg-muted/50 p-1.5 rounded-full">
                      <Button 
                        variant={empSubTab === 'list' ? 'default' : 'ghost'} 
                        size="sm" 
                        className="rounded-full h-10 px-6 text-xs font-bold uppercase tracking-widest"
                        onClick={() => setEmpSubTab('list')}
                      >
                        Registry
                      </Button>
                      <Button 
                        variant={empSubTab === 'attendance' ? 'default' : 'ghost'} 
                        size="sm" 
                        className="rounded-full h-10 px-6 text-xs font-bold uppercase tracking-widest"
                        onClick={() => setEmpSubTab('attendance')}
                      >
                        Daily
                      </Button>
                      <Button 
                        variant={empSubTab === 'report' ? 'default' : 'ghost'} 
                        size="sm" 
                        className="rounded-full h-10 px-6 text-xs font-bold uppercase tracking-widest"
                        onClick={() => setEmpSubTab('report')}
                      >
                        Reports
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-muted/50" onClick={() => changeMonth(-1)}>
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 font-bold px-5 py-2 flex items-center gap-3 text-xs uppercase tracking-[0.2em] rounded-full">
                        <Calendar className="h-4 w-4" />
                        {formatMonthYear(payrollDate)}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-muted/50" onClick={() => changeMonth(1)}>
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  {empSubTab === 'list' && (
                    <>
                      {pendingSalariesCount > 0 && (
                        <Button 
                          variant="secondary" 
                          className="rounded-full h-14 px-8 gap-3 bg-green-600 hover:bg-green-700 text-white border-none shadow-xl shadow-green-100 font-bold"
                          onClick={handlePayAll}
                        >
                          <HandCoins className="h-5 w-5" />
                          Pay All Salaries
                        </Button>
                      )}
                      <Dialog open={isAddEmpOpen} onOpenChange={setIsAddEmpOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold rounded-full h-14 px-8 shadow-xl">
                            <PlusCircle className="mr-3 h-5 w-5" />
                            New Hire
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle className="font-headline text-3xl">Artisan Onboarding</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6 pt-6">
                            <div className="space-y-2">
                              <Label>Full Name</Label>
                              <Input value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} placeholder="Master Craftsman Name" className="h-12" />
                            </div>
                            <div className="space-y-2">
                              <Label>Monthly Salary (₹)</Label>
                              <Input type="number" value={newEmp.salary} onChange={e => setNewEmp({...newEmp, salary: parseInt(e.target.value)})} className="h-12" />
                            </div>
                            <div className="space-y-2">
                              <Label>Role / Specialization</Label>
                              <Input value={newEmp.role} onChange={e => setNewEmp({...newEmp, role: e.target.value})} placeholder="e.g. Vintage Wood Restoration" className="h-12" />
                            </div>
                            <Button className="w-full h-14 bg-accent text-accent-foreground font-bold text-lg rounded-2xl" onClick={handleAddEmp}>Complete Registration</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </div>
              </div>

              {empSubTab === 'list' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                    <Card className="bg-white border-none shadow-xl rounded-[2.5rem] overflow-hidden">
                      <CardContent className="pt-10 p-8">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-3">Active Artisans</p>
                        <p className="text-5xl font-bold text-primary">{employees.length}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white border-none shadow-xl rounded-[2.5rem] overflow-hidden">
                      <CardContent className="pt-10 p-8">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-3">Pending Payroll</p>
                        <p className="text-5xl font-bold text-destructive">{pendingSalariesCount}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-primary text-primary-foreground border-none shadow-xl rounded-[2.5rem] overflow-hidden">
                      <CardContent className="pt-10 p-8">
                        <p className="text-[10px] font-bold text-accent uppercase tracking-[0.3em] mb-3">Monthly Liability</p>
                        <p className="text-4xl font-bold">
                          ₹{employees.filter(e => e.paymentStatus === 'Pending').reduce((s, e) => s + e.salary, 0).toLocaleString('en-IN')}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-white rounded-[2.5rem] border shadow-2xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-muted/50 border-b">
                        <tr className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                          <th className="px-8 py-6">Artisan</th>
                          <th className="px-8 py-6">Specialization</th>
                          <th className="px-8 py-6">Monthly Salary</th>
                          <th className="px-8 py-6">Payroll Status</th>
                          <th className="px-8 py-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {employees.map((emp) => (
                          <tr key={emp.id} className="hover:bg-muted/10 transition-colors">
                            <td className="px-8 py-6">
                              <p className="font-bold text-primary text-lg">{emp.name}</p>
                              <p className="text-[10px] text-muted-foreground font-bold tracking-widest">ARTISAN-ID: {emp.id}</p>
                            </td>
                            <td className="px-8 py-6">
                              <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{emp.role}</span>
                            </td>
                            <td className="px-8 py-6 font-bold text-primary text-lg">₹{emp.salary.toLocaleString('en-IN')}</td>
                            <td className="px-8 py-6">
                              <div className="flex flex-col">
                                <button 
                                  onClick={() => handleToggleStatus(emp)}
                                  className="group/status text-left focus:outline-none w-fit"
                                >
                                  <Badge 
                                    variant={emp.paymentStatus === 'Paid' ? "outline" : "destructive"}
                                    className={cn(
                                      "h-8 px-4 rounded-full font-bold uppercase tracking-widest text-[10px] cursor-pointer transition-all hover:scale-105",
                                      emp.paymentStatus === 'Paid' && "border-green-500 text-green-600 bg-green-50"
                                    )}
                                  >
                                    {emp.paymentStatus}
                                  </Badge>
                                </button>
                                {emp.lastPaidDate && emp.paymentStatus === 'Paid' && (
                                  <p className="text-[10px] text-muted-foreground font-bold mt-2 italic">Disbursed: {emp.lastPaidDate}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-3">
                                {emp.paymentStatus === 'Pending' && (
                                  <Button 
                                    className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold h-11 px-6 rounded-xl shadow-lg"
                                    onClick={() => handlePaySalary(emp.id)}
                                  >
                                    <HandCoins className="mr-2 h-5 w-5" />
                                    Pay
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-muted-foreground hover:text-accent h-10 w-10 rounded-full"
                                  onClick={() => {
                                    setEditingEmp(emp);
                                    setIsEditEmpOpen(true);
                                  }}
                                >
                                  <Pencil className="h-5 w-5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {empSubTab === 'attendance' && (
                <div className="bg-white rounded-[2.5rem] border shadow-2xl overflow-hidden animate-in fade-in duration-500">
                  <div className="p-10 border-b bg-muted/20 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <h3 className="font-headline font-bold text-3xl text-primary">Daily Registry</h3>
                      <p className="text-sm text-muted-foreground mt-2">Record artisanal presence for {todayKey}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm shadow-green-500/50"></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Present</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Absent</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm shadow-yellow-500/50"></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Late</span>
                      </div>
                    </div>
                  </div>
                  <table className="w-full text-left">
                    <thead className="bg-muted/50 border-b">
                      <tr className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                        <th className="px-8 py-6">Artisan</th>
                        <th className="px-8 py-6">Role</th>
                        <th className="px-8 py-6 text-center">Daily Status</th>
                        <th className="px-8 py-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {employees.map((emp) => (
                        <tr key={emp.id} className="hover:bg-muted/10 transition-colors">
                          <td className="px-8 py-6 font-bold text-primary text-lg">{emp.name}</td>
                          <td className="px-8 py-6 text-sm font-bold uppercase text-muted-foreground tracking-widest">{emp.role}</td>
                          <td className="px-8 py-6 text-center">
                            {todayKey && emp.attendance?.[todayKey] ? (
                              <Badge 
                                className={cn(
                                  "font-bold uppercase tracking-widest px-5 py-1.5 rounded-full text-[10px]",
                                  emp.attendance[todayKey] === 'Present' && "bg-green-100 text-green-700 border-green-200",
                                  emp.attendance[todayKey] === 'Absent' && "bg-red-100 text-red-700 border-red-200",
                                  emp.attendance[todayKey] === 'Late' && "bg-yellow-100 text-yellow-700 border-yellow-200"
                                )}
                                variant="outline"
                              >
                                {emp.attendance[todayKey]}
                              </Badge>
                            ) : (
                              <span className="text-xs italic text-muted-foreground/50">Pending record...</span>
                            )}
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-3">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-10 w-10 p-0 rounded-full border-green-200 text-green-600 hover:bg-green-50 shadow-sm"
                                onClick={() => todayKey && updateAttendance(emp.id, todayKey, 'Present')}
                              >
                                <CheckCircle2 className="h-5 w-5" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-10 w-10 p-0 rounded-full border-red-200 text-red-600 hover:bg-red-50 shadow-sm"
                                onClick={() => todayKey && updateAttendance(emp.id, todayKey, 'Absent')}
                              >
                                <X className="h-5 w-5" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-10 w-10 p-0 rounded-full border-yellow-200 text-yellow-600 hover:bg-yellow-50 shadow-sm"
                                onClick={() => todayKey && updateAttendance(emp.id, todayKey, 'Late')}
                              >
                                <Clock className="h-5 w-5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {empSubTab === 'report' && (
                <div className="bg-white rounded-[2.5rem] border shadow-2xl overflow-hidden animate-in fade-in duration-500">
                  <div className="p-10 border-b bg-muted/20 flex items-center justify-between">
                    <div>
                      <h3 className="font-headline font-bold text-3xl text-primary">Artisan Report</h3>
                      <p className="text-sm text-muted-foreground mt-2">Comprehensive month view for {formatMonthYear(payrollDate)}</p>
                    </div>
                  </div>
                  
                  <ScrollArea className="w-full">
                    <div className="min-w-full">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-muted/50 border-b">
                          <tr className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                            <th className="px-8 py-6 sticky left-0 bg-muted/50 border-r z-10 min-w-[250px]">Artisan</th>
                            {days.map(day => (
                              <th key={day} className="px-3 py-6 text-center border-r min-w-[50px]">{day}</th>
                            ))}
                            <th className="px-6 py-6 text-center bg-muted/30 font-bold">Total P</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {employees.map((emp) => {
                            let presentCount = 0;
                            return (
                              <tr key={emp.id} className="hover:bg-muted/5 transition-colors">
                                <td className="px-8 py-6 sticky left-0 bg-white border-r z-10">
                                  <p className="font-bold text-primary text-sm truncate">{emp.name}</p>
                                  <p className="text-[10px] text-muted-foreground font-bold tracking-widest truncate">{emp.role}</p>
                                </td>
                                {days.map(day => {
                                  const dateStr = `${payrollDate.getFullYear()}-${String(payrollDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                  const status = emp.attendance?.[dateStr];
                                  if (status === 'Present') presentCount++;
                                  
                                  return (
                                    <td key={day} className="p-1.5 border-r text-center">
                                      <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold mx-auto shadow-sm",
                                        status === 'Present' && "bg-green-100 text-green-700",
                                        status === 'Absent' && "bg-red-100 text-red-700",
                                        status === 'Late' && "bg-yellow-100 text-yellow-700",
                                        !status && "bg-muted/10 text-muted-foreground/20"
                                      )}>
                                        {status ? status[0] : '-'}
                                      </div>
                                    </td>
                                  );
                                })}
                                <td className="px-6 py-6 text-center bg-muted/5">
                                  <Badge className="bg-green-600 text-white font-bold h-8 px-4 rounded-lg">{presentCount} P</Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </div>
              )}

              <Dialog open={isEditEmpOpen} onOpenChange={setIsEditEmpOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-headline text-3xl">Update Artisan File</DialogTitle>
                  </DialogHeader>
                  {editingEmp && (
                    <div className="space-y-6 pt-6">
                      <div className="space-y-2">
                        <Label>Employee Name</Label>
                        <Input value={editingEmp.name} onChange={e => setEditingEmp({...editingEmp, name: e.target.value})} className="h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label>Monthly Salary (₹)</Label>
                        <Input type="number" value={editingEmp.salary} onChange={e => setEditingEmp({...editingEmp, salary: parseInt(e.target.value)})} className="h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label>Role / Specialization</Label>
                        <Input value={editingEmp.role} onChange={e => setEditingEmp({...editingEmp, role: e.target.value})} className="h-12" />
                      </div>
                      <Button className="w-full h-14 bg-accent text-accent-foreground font-bold text-lg rounded-2xl" onClick={handleUpdateEmp}>
                        Save Records
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="animate-in fade-in duration-500">
              <h1 className="text-5xl font-headline font-bold text-primary mb-16">Acquisition History</h1>
              <div className="bg-white rounded-[2.5rem] border shadow-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-muted/50 border-b">
                    <tr className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                      <th className="px-8 py-6">Order Reference</th>
                      <th className="px-8 py-6">Collector</th>
                      <th className="px-8 py-6">Investment</th>
                      <th className="px-8 py-6">Current Stage</th>
                      <th className="px-8 py-6 text-right">Acquisition File</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-8 py-6 font-bold text-primary text-lg">{order.id}</td>
                        <td className="px-8 py-6 text-sm font-bold uppercase tracking-widest text-muted-foreground">{order.customerName}</td>
                        <td className="px-8 py-6 font-bold text-accent text-lg">₹{order.total.toLocaleString('en-IN')}</td>
                        <td className="px-8 py-6">
                          <Select 
                            value={order.status} 
                            onValueChange={(val) => updateOrderStatus(order.id, val as Order['status'])}
                          >
                            <SelectTrigger className="h-10 w-[180px] text-xs font-bold uppercase tracking-widest rounded-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Awaiting Verification">Awaiting Payment Verification</SelectItem>
                              <SelectItem value="Processing">Acquisition Accepted</SelectItem>
                              <SelectItem value="Shipped">In Transit</SelectItem>
                              <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                              <SelectItem value="Delivered">Delivered & Verified</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <Button asChild variant="outline" size="sm" className="h-10 px-6 rounded-full border-accent text-accent font-bold hover:bg-accent hover:text-white transition-all">
                            <Link href={`/order/${order.id}/bill`}>Digital Bill</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-in fade-in duration-500 max-w-4xl">
              <h1 className="text-5xl font-headline font-bold text-primary mb-16">Store Identity</h1>
              <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden">
                <CardContent className="pt-10 p-10 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Store Name</Label>
                      <Input value={tempSettings.name} onChange={e => setTempSettings({...tempSettings, name: e.target.value})} className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Owner / Founder</Label>
                      <Input value={tempSettings.ownerName} onChange={e => setTempSettings({...tempSettings, ownerName: e.target.value})} className="h-12 rounded-xl" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Artisanal Email</Label>
                      <Input value={tempSettings.email} onChange={e => setTempSettings({...tempSettings, email: e.target.value})} className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Contact Phone</Label>
                      <Input value={tempSettings.phone} onChange={e => setTempSettings({...tempSettings, phone: e.target.value})} className="h-12 rounded-xl" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Studio Address</Label>
                    <Input value={tempSettings.address} onChange={e => setTempSettings({...tempSettings, address: e.target.value})} className="h-12 rounded-xl" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                        <ImageIcon className="h-4 w-4" />
                        Master Logo URL
                      </Label>
                      <Input value={tempSettings.logoUrl} onChange={e => setTempSettings({...tempSettings, logoUrl: e.target.value})} className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                        <ImageIcon className="h-4 w-4" />
                        Hero Piece URL
                      </Label>
                      <Input value={tempSettings.heroImageUrl} onChange={e => setTempSettings({...tempSettings, heroImageUrl: e.target.value})} className="h-12 rounded-xl" />
                    </div>
                  </div>

                  <div className="p-10 bg-red-50 border-2 border-dashed border-red-200 rounded-[2.5rem] space-y-5 shadow-inner">
                    <div className="flex items-center gap-3 text-red-600 font-bold">
                      <AlertTriangle className="h-6 w-6" />
                      Important: High-Resolution Hosting
                    </div>
                    <p className="text-sm text-red-900 leading-relaxed font-medium">
                      Google Drive and Google Photos URLs are now fully supported. Please ensure your links are set to "Anyone with the link can view" to prevent display errors. Avoid using temporary paths.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                        <Smartphone className="h-4 w-4" />
                        Store UPI ID
                      </Label>
                      <Input value={tempSettings.upiId} onChange={e => setTempSettings({...tempSettings, upiId: e.target.value})} className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                        <QrCode className="h-4 w-4" />
                        Payment QR Code URL
                      </Label>
                      <Input value={tempSettings.paymentQrCodeUrl} onChange={e => setTempSettings({...tempSettings, paymentQrCodeUrl: e.target.value})} className="h-12 rounded-xl" />
                    </div>
                  </div>
                  <Button className="w-full bg-primary text-white font-bold h-16 rounded-2xl text-lg shadow-2xl transition-all hover:scale-[1.02]" onClick={() => {
                    setStoreSettings(tempSettings);
                    toast({ title: "Identity Updated", description: "Your store configuration has been saved." });
                  }}>
                    Save All Configurations
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}