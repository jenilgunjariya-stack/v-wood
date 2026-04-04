"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { useStore, StoreSettings } from "@/app/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle, Edit, Trash2, Settings, Package, Image as ImageIcon, Save, RefreshCw, User as UserIcon, LogOut, Lock, ShoppingBag, Truck, CheckCircle, MapPin, User, CreditCard, Banknote, Wallet, Box, Users, HandCoins, CheckCircle2, Pencil, Calendar, ChevronLeft, ChevronRight, RotateCcw, X, DollarSign, QrCode, Globe, Smartphone, Clock, AlertTriangle, FileBarChart2, Camera, Star, ClipboardList, LayoutList } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock as ClockType, Order, Employee, Task } from "@/app/lib/types";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminPage() {
  const { 
    products, 
    orders, 
    employees, 
    updateOrderStatus, 
    updateEmployeeStatus, 
    payAllEmployees, 
    addEmployee, 
    updateEmployee, 
    removeEmployee, 
    resetPayroll, 
    updateAttendance, 
    updateProducts, 
    storeSettings, 
    setStoreSettings,
    tasks,
    addTask,
    updateTaskStatus,
    updateTask,
    removeTask,
    ratings,
    addOrder,
    logout,
    isAdmin,
    userName,
    userPhoto
  } = useStore();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'employees' | 'settings' | 'cameras' | 'ratings' | 'tasks' | 'billing'>('products');
  const [empSubTab, setEmpSubTab] = useState<'list' | 'attendance' | 'report'>('list');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddEmpOpen, setIsAddEmpOpen] = useState(false);
  const [isEditEmpOpen, setIsEditEmpOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);

  const [mounted, setMounted] = useState(false);
  const [payrollDate, setPayrollDate] = useState<Date>(new Date());
  const [ordersDate, setOrdersDate] = useState<Date>(new Date());
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
    category: "Wall Clock",
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
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [offlineForm, setOfflineForm] = useState({
    customerName: "",
    customerAddress: "",
    customerPhone: "",
    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    items: [] as any[]
  });
  const [tempSettings, setTempSettings] = useState<StoreSettings>(storeSettings);

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(payrollDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setPayrollDate(newDate);
  };

  const changeOrdersMonth = (offset: number) => {
    const newDate = new Date(ordersDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setOrdersDate(newDate);
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
    setNewClock({ name: "", price: 0, description: "", style: "Modern", category: "Wall Clock", imageUrl: "", specifications: ["Battery Powered", "Quartz Movement"], stock: 0 });
    toast({ title: "Product Added", description: "New timepiece successfully listed." });
  };

  const handleAddOfflineItem = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existing = offlineForm.items.find(item => item.id === productId);
    if (existing) {
      setOfflineForm({
        ...offlineForm,
        items: offlineForm.items.map(item => 
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        )
      });
    } else {
      setOfflineForm({
        ...offlineForm,
        items: [...offlineForm.items, {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          imageUrl: product.imageUrl,
          style: product.style
        }]
      });
    }
  };

  const handleGenerateOfflineBill = () => {
    if (!offlineForm.customerName || offlineForm.items.length === 0) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please enter customer details and add at least one item." });
      return;
    }

    const subtotal = offlineForm.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const orderId = `V-WOOD-OFF- ${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const newOrder: Order = {
      id: orderId,
      customerName: offlineForm.customerName,
      customerAddress: offlineForm.customerAddress || "In-Shop Purchase",
      customerPhone: offlineForm.customerPhone || "N/A",
      items: offlineForm.items,
      total: subtotal,
      status: "Delivered",
      date: offlineForm.date,
      paymentMethod: "In-Shop"
    };

    addOrder(newOrder);
    setOfflineForm({ 
      customerName: "", 
      customerAddress: "", 
      customerPhone: "",
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), 
      items: [] 
    });
    toast({ title: "Bill Generated", description: `Order ${orderId} successfully registered.` });
    router.push(`/order/${orderId}/bill`);
  };

  const handleUpdateTask = () => {
    if (editingTask) {
      updateTask(editingTask);
      setIsEditTaskOpen(false);
      setEditingTask(null);
      toast({ title: "Task Updated", description: "The task record has been updated successfully." });
    }
  };

  const handleAddTask = () => {
    if (!newTask.title.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Task title is required." });
      return;
    }
    addTask({
      title: newTask.title,
      description: newTask.description,
      status: 'Pending'
    });
    setNewTask({ title: "", description: "" });
    setIsAddTaskOpen(false);
    toast({ title: "Task Created", description: "New task has been added to the working registry." });
  };

  const handleLogout = () => {
    logout();
    toast({ title: "Logged Out", description: "Session ended successfully." });
    window.location.href = "/login";
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
              {(pendingVerificationCount > 0 || orders.some(o => o.status === 'Cancelled')) && (
                <span className={cn(
                  "ml-auto w-6 h-6 text-accent-foreground text-[10px] flex items-center justify-center rounded-full font-bold shadow-lg shadow-accent/40",
                  orders.some(o => o.status === 'Cancelled') ? "bg-red-500 text-white animate-bounce" : "bg-accent animate-pulse"
                )}>
                  {pendingVerificationCount + orders.filter(o => o.status === 'Cancelled').length}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-4 h-14 rounded-2xl transition-all",
                activeTab === 'billing' ? "bg-accent/20 text-accent font-bold" : "opacity-60"
              )}
              onClick={() => setActiveTab('billing')}
            >
              <Banknote className="h-5 w-5" /> Offline Bill
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
                activeTab === 'cameras' ? "bg-accent/20 text-accent font-bold" : "opacity-60"
              )}
              onClick={() => setActiveTab('cameras')}
            >
              <Camera className="h-5 w-5" /> Camera Access
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-4 h-14 rounded-2xl transition-all",
                activeTab === 'ratings' ? "bg-accent/20 text-accent font-bold" : "opacity-60"
              )}
              onClick={() => setActiveTab('ratings')}
            >
              <Star className="h-5 w-5" /> Ratings
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-4 h-14 rounded-2xl transition-all",
                activeTab === 'tasks' ? "bg-accent/20 text-accent font-bold" : "opacity-60"
              )}
              onClick={() => setActiveTab('tasks')}
            >
              <LayoutList className="h-5 w-5" /> Working Section
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
          {activeTab === 'billing' && (
            <div className="animate-in fade-in duration-700 max-w-5xl mx-auto pb-20">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-16">
                <div>
                  <h1 className="text-5xl font-headline font-bold text-primary">Offline Billing Terminal</h1>
                  <p className="text-muted-foreground mt-2 text-lg">Generate artisanal billing for walk-in studio guests.</p>
                </div>
                <div className="flex items-center gap-4 px-8 py-4 bg-primary text-white rounded-[2rem] shadow-2xl">
                   <div className="h-3 w-3 bg-accent rounded-full animate-pulse shadow-sm shadow-accent/50" />
                   <span className="text-xs font-bold uppercase tracking-[0.2em]">Live Bill Processor</span>
                </div>
              </div>

              <div className="bg-white rounded-[3.5rem] border-8 border-primary/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden relative">
                {/* Header Section */}
                <div className="bg-primary p-16 pb-24 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/[0.03] rounded-full -mr-32 -mt-32" />
                  <div className="flex flex-col md:flex-row justify-between items-start gap-12 relative z-10">
                    <div className="space-y-8">
                       <div className="w-32 h-32 bg-white rounded-3xl p-6 shadow-2xl rotate-3">
                         <img src={storeSettings.logoUrl} alt="Store Logo" className="w-full h-full object-contain" />
                       </div>
                       <div className="space-y-2">
                         <h2 className="text-4xl font-headline font-bold text-accent">Artisanal Receipt</h2>
                         <p className="text-white/40 text-xs font-bold uppercase tracking-[0.4em]">Draft Verification Piece</p>
                       </div>
                    </div>
                    
                    <div className="text-right space-y-6">
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Studio Reference</p>
                          <p className="text-2xl font-bold font-mono text-white/90 tracking-tighter">#V-WOOD-DRAFT</p>
                       </div>
                       <div className="space-y-3">
                          <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Acquisition Date</p>
                          <Input 
                            type="text" 
                            value={offlineForm.date} 
                            onChange={e => setOfflineForm({...offlineForm, date: e.target.value})}
                            className="bg-white/10 border-white/20 text-white text-right h-12 w-48 rounded-xl font-bold px-4"
                            placeholder="e.g. 02 Apr, 2026"
                          />
                       </div>
                    </div>
                  </div>
                </div>

                {/* Body Section */}
                <div className="p-16 -mt-16 relative z-20">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                     {/* Customer Details */}
                     <div className="space-y-10">
                        <div className="p-10 rounded-[3rem] bg-muted/30 border-2 border-dashed border-primary/5 space-y-8">
                           <div className="flex items-center gap-4">
                              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                <UserIcon className="h-5 w-5 text-primary" />
                              </div>
                              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Guest Credentials</h3>
                           </div>
                           <div className="space-y-6">
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Full Legal Name</Label>
                                <Input 
                                  value={offlineForm.customerName}
                                  onChange={e => setOfflineForm({...offlineForm, customerName: e.target.value})}
                                  placeholder="Master Collector Name"
                                  className="h-14 bg-white border-primary/10 focus:border-accent rounded-2xl font-bold px-6"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Mobile Contact</Label>
                                <Input 
                                  value={offlineForm.customerPhone}
                                  onChange={e => setOfflineForm({...offlineForm, customerPhone: e.target.value})}
                                  placeholder="Collector Phone"
                                  className="h-14 bg-white border-primary/10 focus:border-accent rounded-2xl font-bold px-6"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Studio Address / Delivery Point</Label>
                                <Textarea 
                                  value={offlineForm.customerAddress}
                                  onChange={e => setOfflineForm({...offlineForm, customerAddress: e.target.value})}
                                  placeholder="Residence Detail"
                                  className="min-h-[120px] bg-white border-primary/10 focus:border-accent rounded-[2rem] font-medium p-6"
                                />
                              </div>
                           </div>
                        </div>

                        <div className="p-10 rounded-[3rem] bg-accent/5 border-2 border-accent/20 space-y-6">
                           <div className="flex items-center gap-3 text-accent font-bold">
                              <AlertTriangle className="h-5 w-5" />
                              <span className="text-xs uppercase tracking-widest">In-Shop Verification</span>
                           </div>
                           <p className="text-xs text-accent/80 font-medium leading-relaxed">
                             This bill confirms manual payment collection in-shop. Ensure the artisanal seal is physically stamped on the printed receipt for high-value collectors.
                           </p>
                        </div>
                     </div>

                     {/* Product Selection & Items */}
                     <div className="space-y-10">
                        <div className="space-y-6">
                           <div className="flex items-center justify-between">
                              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Acquisition Items</h3>
                              <Select onValueChange={(val) => {
                                const p = products.find(prod => prod.id === val);
                                if (p) setOfflineForm({...offlineForm, items: [...offlineForm.items, { ...p, quantity: 1 }]});
                              }}>
                                <SelectTrigger className="h-12 w-[280px] bg-primary text-white border-none rounded-full shadow-xl hover:scale-105 transition-all text-xs font-bold uppercase tracking-widest">
                                  <SelectValue placeholder="Add Studio Piece" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-none shadow-2xl">
                                  {products.map(p => (
                                    <SelectItem key={p.id} value={p.id} className="h-12 rounded-xl">
                                      {p.name} - Rs. {p.price.toLocaleString('en-IN')}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                           </div>

                           <div className="p-8 rounded-[3rem] border-2 border-primary/5 bg-white space-y-4">
                              {offlineForm.items.length === 0 ? (
                                <div className="py-20 text-center space-y-4">
                                   <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto">
                                     <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
                                   </div>
                                   <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest italic">Inventory Terminal Idle</p>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {offlineForm.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-5 bg-muted/20 rounded-2xl group transition-all hover:bg-muted/40">
                                      <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl overflow-hidden shadow-lg">
                                          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                        </div>
                                        <div>
                                          <p className="text-sm font-bold text-primary">{item.name}</p>
                                          <p className="text-[9px] font-bold text-accent uppercase tracking-widest italic">Rs. {item.price.toLocaleString('en-IN')} / unit</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-6">
                                         <div className="flex items-center bg-white rounded-full p-1 border shadow-sm">
                                            <button 
                                              className="w-8 h-8 rounded-full hover:bg-muted font-bold text-primary"
                                              onClick={() => {
                                                const updated = offlineForm.items.map((it, i) => 
                                                  i === idx ? { ...it, quantity: Math.max(1, it.quantity - 1) } : it
                                                );
                                                setOfflineForm({...offlineForm, items: updated});
                                              }}
                                            >-</button>
                                            <span className="text-xs font-black min-w-[30px] text-center">{item.quantity}</span>
                                            <button 
                                              className="w-8 h-8 rounded-full hover:bg-muted font-bold text-primary"
                                              onClick={() => {
                                                const updated = offlineForm.items.map((it, i) => 
                                                  i === idx ? { ...it, quantity: it.quantity + 1 } : it
                                                );
                                                setOfflineForm({...offlineForm, items: updated});
                                              }}
                                            >+</button>
                                         </div>
                                         <button 
                                            className="h-8 w-8 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                            onClick={() => setOfflineForm({...offlineForm, items: offlineForm.items.filter((_, i) => i !== idx)})}
                                         >
                                            <Trash2 className="h-4 w-4" />
                                         </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                           </div>
                        </div>

                        <div className="p-10 rounded-[3rem] bg-primary text-white space-y-8 shadow-2xl relative overflow-hidden group">
                           <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                           <div className="space-y-4 relative z-10">
                              <div className="flex justify-between items-center text-white/40 text-[10px] font-bold uppercase tracking-widest">
                                 <span>Subtotal Assessment</span>
                                 <span>Rs. {offlineForm.items.reduce((acc, item) => acc + (item.price * item.quantity), 0).toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between items-center text-white/40 text-[10px] font-bold uppercase tracking-widest">
                                 <span>Artisanal Tax / Handling</span>
                                 <span className="text-accent underline underline-offset-4 decoration-2">WAIVED</span>
                              </div>
                              <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                                 <div>
                                   <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em] mb-2 leading-none text-glow">Final Bill Amount</p>
                                   <p className="text-5xl font-headline font-bold tracking-tighter leading-none">
                                     Rs. {offlineForm.items.reduce((acc, item) => acc + (item.price * item.quantity), 0).toLocaleString('en-IN')}
                                   </p>
                                 </div>
                                 <div className="text-right">
                                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                                      <CheckCircle2 className="h-8 w-8 text-accent" />
                                    </div>
                                 </div>
                              </div>
                           </div>
                           
                           <Button 
                             onClick={handleGenerateOfflineBill}
                             className="w-full h-20 bg-accent text-accent-foreground font-black text-xl rounded-[1.5rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] transition-all hover:scale-[1.02] active:scale-95 group relative z-10 overflow-hidden"
                           >
                              <div className="relative z-10 flex items-center gap-4">
                                <Save className="h-7 w-7" />
                                COMPLETE ACQUISITION & PRINT
                              </div>
                           </Button>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          )}
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
                        if (confirm(`Remove all ${outOfStockCount} out of stock products?`)) {
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
                            <Label>Product Name</Label>
                            <Input value={newClock.name} onChange={e => setNewClock({ ...newClock, name: e.target.value })} placeholder="Classic Gold" className="h-12" />
                          </div>
                          <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={newClock.category} onValueChange={(val) => setNewClock({ ...newClock, category: val })}>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select Category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Wall Clock">Wall Clock</SelectItem>
                                <SelectItem value="Alarm Clock">Alarm Clock</SelectItem>
                                <SelectItem value="Hand Watch">Hand Watch</SelectItem>
                                <SelectItem value="Photo Frame">Photo Frame</SelectItem>
                                <SelectItem value="Table Clock">Table Clock</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Style / Aesthetic</Label>
                            <Select onValueChange={(val) => setNewClock({ ...newClock, style: val })}>
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
                            <Label>Price (Rs.)</Label>
                            <Input type="number" value={newClock.price} onChange={e => setNewClock({ ...newClock, price: parseInt(e.target.value) })} className="h-12" />
                          </div>
                          <div className="space-y-2">
                            <Label>Stock (Qty)</Label>
                            <Input type="number" value={newClock.stock} onChange={e => setNewClock({ ...newClock, stock: parseInt(e.target.value) })} className="h-12" />
                          </div>
                          <div className="space-y-2">
                            <Label>Shape</Label>
                            <Select onValueChange={(val) => setNewClock({ ...newClock, shape: val } as any)}>
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
                                  onChange={e => setNewClock({ ...newClock, imageUrl: e.target.value })}
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
                          <Textarea value={newClock.description} onChange={e => setNewClock({ ...newClock, description: e.target.value })} className="min-h-[120px]" />
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
                      <th className="px-8 py-6">Category</th>
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
                            <span className="font-bold text-primary">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/20 font-bold px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest">
                            {p.category || "General"}
                          </Badge>
                        </td>
                        <td className="px-8 py-6 font-bold text-primary text-lg">Rs. {p.price.toLocaleString('en-IN')}</td>
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
                          <Input value={editingClock.name} onChange={e => setEditingClock({ ...editingClock, name: e.target.value })} className="h-12" />
                        </div>
                        <div className="space-y-2">
                          <Label>Style / Aesthetic</Label>
                          <Input value={editingClock.style} onChange={e => setEditingClock({ ...editingClock, style: e.target.value })} className="h-12" />
                        </div>
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select
                            value={editingClock.category}
                            onValueChange={(val) => setEditingClock({ ...editingClock, category: val })}
                          >
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Wall Clock">Wall Clock</SelectItem>
                              <SelectItem value="Alarm Clock">Alarm Clock</SelectItem>
                              <SelectItem value="Hand Watch">Hand Watch</SelectItem>
                              <SelectItem value="Photo Frame">Photo Frame</SelectItem>
                              <SelectItem value="Table Clock">Table Clock</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label>Price (₹)</Label>
                          <Input type="number" value={editingClock.price} onChange={e => setEditingClock({ ...editingClock, price: parseInt(e.target.value) })} className="h-12" />
                        </div>
                        <div className="space-y-2">
                          <Label>Stock Quantity</Label>
                          <Input type="number" value={editingClock.stock} onChange={e => setEditingClock({ ...editingClock, stock: parseInt(e.target.value) })} className="h-12" />
                        </div>
                        <div className="space-y-2">
                          <Label>Discount Price (₹)</Label>
                          <Input
                            type="number"
                            value={(editingClock as any).discountPrice || ""}
                            onChange={e => setEditingClock({ ...editingClock, discountPrice: parseInt(e.target.value) } as any)}
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
                                onChange={e => setEditingClock({ ...editingClock, imageUrl: e.target.value })}
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
                        <Textarea value={editingClock.description} onChange={e => setEditingClock({ ...editingClock, description: e.target.value })} className="min-h-[120px]" />
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

          {activeTab === 'ratings' && (
            <div className="animate-in fade-in duration-500">
              <div className="mb-10">
                <h1 className="text-5xl font-headline font-bold text-primary">Customer Feedback</h1>
                <p className="text-muted-foreground mt-2 text-lg">Oversee all ratings and reviews submitted by artisanal collectors.</p>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                <Card className="bg-white border-none shadow-xl rounded-[2.5rem] overflow-hidden">
                  <CardContent className="pt-10 p-8">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-3">Total Reviews</p>
                    <p className="text-5xl font-bold text-primary">{ratings.length}</p>
                  </CardContent>
                </Card>
                <Card className="bg-primary text-primary-foreground border-none shadow-xl rounded-[2.5rem] overflow-hidden">
                  <CardContent className="pt-10 p-8">
                    <p className="text-[10px] font-bold text-accent uppercase tracking-[0.3em] mb-3">Unique Raters</p>
                    <p className="text-5xl font-bold">{new Set(ratings.map(r => r.userName)).size}</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border-none shadow-xl rounded-[2.5rem] overflow-hidden">
                  <CardContent className="pt-10 p-8">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-3">Average Rating</p>
                    <div className="flex items-center gap-3">
                      <p className="text-5xl font-bold text-primary">
                        {ratings.length > 0
                          ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1)
                          : "—"}
                      </p>
                      {ratings.length > 0 && <Star className="h-8 w-8 fill-accent text-accent" />}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-white rounded-[2.5rem] border shadow-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-muted/50 border-b">
                    <tr className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                      <th className="px-8 py-6">Customer</th>
                      <th className="px-8 py-6">Product</th>
                      <th className="px-8 py-6">Rating Given</th>
                      <th className="px-8 py-6">Date</th>
                      <th className="px-8 py-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {ratings.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-20 text-center text-muted-foreground italic">
                          No customer ratings recorded yet.
                        </td>
                      </tr>
                    ) : (
                      ratings.map((rating) => {
                        const product = products.find(p => p.id === rating.productId);
                        return (
                          <tr key={rating.id} className="hover:bg-muted/5 transition-colors">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-10 w-10 border border-primary/10">
                                  <AvatarImage src={rating.userPhoto} />
                                  <AvatarFallback className="bg-muted text-primary">{rating.userName[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-bold text-primary">{rating.userName}</p>
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Collector</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-muted p-1">
                                  <img src={product?.imageUrl} className="w-full h-full object-cover rounded-md" />
                                </div>
                                <span className="font-bold text-sm text-primary truncate max-w-[150px]">{product?.name || "Unknown Product"}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                <span className="text-xl font-black text-accent">{rating.rating}</span>
                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">/ 5</span>
                                <div className="flex items-center gap-0.5 ml-1">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className={cn("h-3.5 w-3.5", s <= rating.rating ? "fill-accent text-accent" : "text-muted-foreground/20")} />
                                  ))}
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className="text-sm font-bold text-muted-foreground">{rating.date}</span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <Badge className="bg-green-500 text-white border-none text-[9px] uppercase tracking-widest font-bold h-6 px-3">Verified</Badge>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
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
                              <Input value={newEmp.name} onChange={e => setNewEmp({ ...newEmp, name: e.target.value })} placeholder="Master Craftsman Name" className="h-12" />
                            </div>
                            <div className="space-y-2">
                              <Label>Monthly Salary (Rs.)</Label>
                              <Input type="number" value={newEmp.salary} onChange={e => setNewEmp({ ...newEmp, salary: parseInt(e.target.value) })} className="h-12" />
                            </div>
                            <div className="space-y-2">
                              <Label>Role / Specialization</Label>
                              <Input value={newEmp.role} onChange={e => setNewEmp({ ...newEmp, role: e.target.value })} placeholder="e.g. Vintage Wood Restoration" className="h-12" />
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
                            <td className="px-8 py-6 font-bold text-primary text-lg">Rs. {emp.salary.toLocaleString('en-IN')}</td>
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
                        <Input value={editingEmp.name} onChange={e => setEditingEmp({ ...editingEmp, name: e.target.value })} className="h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label>Monthly Salary (Rs.)</Label>
                        <Input type="number" value={editingEmp.salary} onChange={e => setEditingEmp({ ...editingEmp, salary: parseInt(e.target.value) })} className="h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label>Role / Specialization</Label>
                        <Input value={editingEmp.role} onChange={e => setEditingEmp({ ...editingEmp, role: e.target.value })} className="h-12" />
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

          {activeTab === 'orders' && (() => {
            const currentOrders = orders.filter(o => {
              const dStr = (o.date || "").replace(' at ', ' ');
              const d = new Date(dStr);
              if (isNaN(d.getTime())) return true;
              return d.getMonth() === ordersDate.getMonth() && d.getFullYear() === ordersDate.getFullYear();
            });

            return (
            <div className="animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
                <div className="space-y-1">
                  <h1 className="text-5xl font-headline font-bold text-primary">Acquisition History</h1>
                  <p className="text-muted-foreground text-lg">Filter and view monthly orders.</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-muted/50" onClick={() => changeOrdersMonth(-1)}>
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 font-bold px-5 py-2 flex items-center gap-3 text-xs uppercase tracking-[0.2em] rounded-full">
                      <Calendar className="h-4 w-4" />
                      {formatMonthYear(ordersDate)}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-muted/50" onClick={() => changeOrdersMonth(1)}>
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                  {currentOrders.some(o => o.status === 'Cancelled') && (
                    <div className="flex items-center gap-4 px-8 py-4 bg-red-50 border-2 border-dashed border-red-200 rounded-[2rem] animate-in slide-in-from-right duration-500">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-red-700 uppercase tracking-[0.2em] mb-1">Customer Retraction</p>
                        <p className="text-xs font-bold text-red-900 uppercase tracking-widest leading-none">
                          {currentOrders.filter(o => o.status === 'Cancelled').length} Order(s) Marked as Cancelled
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-[2.5rem] border shadow-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-muted/50 border-b">
                    <tr className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                      <th className="px-8 py-6">Order Reference</th>
                      <th className="px-8 py-6">Collector</th>
                      <th className="px-8 py-6">Investment</th>
                      <th className="px-8 py-6">Expected Arrival</th>
                      <th className="px-8 py-6">Current Stage</th>
                      <th className="px-8 py-6 text-right">Acquisition File</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {currentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-8 py-20 text-center text-muted-foreground italic font-bold">
                          No orders found for {formatMonthYear(ordersDate)}.
                        </td>
                      </tr>
                    ) : (
                      currentOrders.map((order) => (
                        <tr key={order.id} className={cn(
                          "hover:bg-muted/10 transition-colors",
                          order.status === 'Cancelled' && "bg-red-50/40 opacity-80"
                        )}>
                          <td className="px-8 py-6 font-bold text-primary text-lg">
                             <div className="flex flex-col gap-1">
                               {order.id}
                               {order.paymentMethod === 'In-Shop' && (
                                 <Badge className="w-fit bg-accent/20 text-accent border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5">
                                   Physical Studio
                                 </Badge>
                               )}
                             </div>
                          </td>
                          <td className="px-8 py-6 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                              <div className="flex flex-col gap-1">
                                {order.customerName}
                                <span className="text-[10px] text-accent lowercase font-mono">{order.customerPhone}</span>
                              </div>
                          </td>
                          <td className="px-8 py-6 font-bold text-accent text-lg">Rs. {order.total.toLocaleString('en-IN')}</td>
                          <td className="px-8 py-6">
                            <p className="text-sm font-bold text-primary">
                              {new Date(new Date((order.date || "").replace(' at ', ' ')).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })}
                            </p>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Est. Completion</p>
                          </td>
                          <td className="px-8 py-6">
                            <Select
                              value={order.status}
                              onValueChange={(val) => updateOrderStatus(order.id, val as Order['status'])}
                            >
                              <SelectTrigger className="h-10 w-[180px] text-xs font-bold uppercase tracking-widest rounded-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Confirmed">Order Confirmed</SelectItem>
                                <SelectItem value="Awaiting Verification">Awaiting Payment Verification</SelectItem>
                                <SelectItem value="Processing">Acquisition Accepted</SelectItem>
                                <SelectItem value="Shipped">In Transit</SelectItem>
                                <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                                <SelectItem value="Delivered">Delivered & Verified</SelectItem>
                                <SelectItem value="Cancelled">Cancelled by Customer</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-10 px-6 rounded-full font-bold bg-muted/50 hover:bg-muted">
                                    Details
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle className="font-headline text-3xl">Order Information</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-6 pt-4 text-left">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/10 p-6 rounded-[2rem] border border-primary/5">
                                      <div>
                                        <p className="font-bold text-muted-foreground uppercase tracking-widest text-[10px] mb-1">Customer Name</p>
                                        <p className="font-bold text-lg text-primary">{order.customerName}</p>
                                      </div>
                                      <div>
                                        <p className="font-bold text-muted-foreground uppercase tracking-widest text-[10px] mb-1">Order Date</p>
                                        <p className="font-bold text-lg text-primary">{order.date}</p>
                                      </div>
                                      <div>
                                        <p className="font-bold text-muted-foreground uppercase tracking-widest text-[10px] mb-1">Payment Method</p>
                                        <div className="flex items-center gap-2 mt-1">
                                          <Badge className="bg-accent/10 border-none text-accent font-black uppercase tracking-widest px-3 py-1">
                                            {order.paymentMethod || 'Not Specified'}
                                          </Badge>
                                        </div>
                                      </div>
                                      <div>
                                        <p className="font-bold text-muted-foreground uppercase tracking-widest text-[10px] mb-1">Mobile Number</p>
                                        <p className="font-bold text-lg text-primary">{order.customerPhone || 'Not Specified'}</p>
                                      </div>
                                      <div className="col-span-1 md:col-span-2">
                                        <p className="font-bold text-muted-foreground uppercase tracking-widest text-[10px] mb-1">Address</p>
                                        <p className="font-bold text-lg text-primary">{order.customerAddress}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <p className="font-bold text-muted-foreground uppercase tracking-[0.2em] text-[10px] mb-4">Products Acquired</p>
                                      <div className="space-y-4">
                                        {order.items.map((item, idx) => (
                                          <div key={idx} className="flex items-center gap-5 bg-white p-4 rounded-2xl border shadow-sm">
                                            <div className="h-16 w-16 rounded-xl bg-muted overflow-hidden shrink-0 border p-1">
                                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                                            </div>
                                            <div className="flex-1">
                                              <p className="font-bold text-primary">{item.name}</p>
                                              <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Quantity: {item.quantity}</p>
                                            </div>
                                            <p className="font-bold text-accent text-lg">Rs. {(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button asChild variant="outline" size="sm" className="h-10 px-6 rounded-full border-accent text-accent font-bold hover:bg-accent hover:text-white transition-all">
                                <Link href={`/order/${order.id}/bill`}>Digital Bill</Link>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            );
          })()}


          {activeTab === 'settings' && (
            <div className="animate-in fade-in duration-500 max-w-4xl">
              <h1 className="text-5xl font-headline font-bold text-primary mb-16">Store Identity</h1>
              <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden">
                <CardContent className="pt-10 p-10 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Store Name</Label>
                      <Input value={tempSettings.name} onChange={e => setTempSettings({ ...tempSettings, name: e.target.value })} className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Owner / Founder</Label>
                      <Input value={tempSettings.ownerName} onChange={e => setTempSettings({ ...tempSettings, ownerName: e.target.value })} className="h-12 rounded-xl" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Artisanal Email</Label>
                      <Input value={tempSettings.email} onChange={e => setTempSettings({ ...tempSettings, email: e.target.value })} className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Contact Phone</Label>
                      <Input value={tempSettings.phone} onChange={e => setTempSettings({ ...tempSettings, phone: e.target.value })} className="h-12 rounded-xl" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Studio Address</Label>
                    <Input value={tempSettings.address} onChange={e => setTempSettings({ ...tempSettings, address: e.target.value })} className="h-12 rounded-xl" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Studio Hours (Closed Days)</Label>
                      <Input value={tempSettings.openingHours} onChange={e => setTempSettings({ ...tempSettings, openingHours: e.target.value })} className="h-12 rounded-xl" placeholder="e.g. 8:00 AM - 6:00 PM (Closed on Wednesdays)" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Local Map URL (Google Maps)</Label>
                      <Input value={tempSettings.locationUrl} onChange={e => setTempSettings({ ...tempSettings, locationUrl: e.target.value })} className="h-12 rounded-xl" placeholder="https://maps.app.goo.gl/..." />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                        <ImageIcon className="h-4 w-4" />
                        Master Logo URL
                      </Label>
                      <Input value={tempSettings.logoUrl} onChange={e => setTempSettings({ ...tempSettings, logoUrl: e.target.value })} className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                        <ImageIcon className="h-4 w-4" />
                        Hero Piece URL
                      </Label>
                      <Input value={tempSettings.heroImageUrl} onChange={e => setTempSettings({ ...tempSettings, heroImageUrl: e.target.value })} className="h-12 rounded-xl" />
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
                      <Input value={tempSettings.upiId} onChange={e => setTempSettings({ ...tempSettings, upiId: e.target.value })} className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                        <QrCode className="h-4 w-4" />
                        Payment QR Code URL
                      </Label>
                      <Input value={tempSettings.paymentQrCodeUrl} onChange={e => setTempSettings({ ...tempSettings, paymentQrCodeUrl: e.target.value })} className="h-12 rounded-xl" />
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

          {activeTab === 'cameras' && (
            <div className="animate-in fade-in duration-500">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-16">
                <div>
                  <h1 className="text-5xl font-headline font-bold text-primary">Camera Feeds</h1>
                  <p className="text-muted-foreground mt-2 text-lg">Secure real-time observation of all locations.</p>
                </div>
                <div className="p-4 bg-accent/5 border border-accent/20 rounded-2xl flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-sm shadow-red-500" />
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">LIVE Feed Recording</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {[
                  { name: "Main Showroom", location: "Morbi HQ", status: "Active", time: "LIVE" },
                  { name: "Artisan Workshop", location: "Ground Floor", status: "Active", time: "LIVE" },
                  { name: "Storage Facility", location: "Unit-B", status: "Idle", time: "STAND-BY" },
                  { name: "Entrance Gate", location: "Security Post", status: "Active", time: "LIVE" }
                ].map((cam, i) => (
                  <Card key={i} className={cn(
                    "bg-white border-2 border-primary/5 shadow-2xl rounded-[3rem] overflow-hidden group transition-all duration-700 hover:border-accent/40",
                    cam.status === 'Idle' && "grayscale opacity-80"
                  )}>
                    <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                      <img
                        src={`https://picsum.photos/seed/camera-${i}/1280/720`}
                        alt={cam.name}
                        className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-[20s]"
                      />

                      <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-2xl">
                            <div className={cn("w-2 h-2 rounded-full", cam.status === 'Active' ? "bg-red-600 animate-pulse shadow-red-500 shadow-sm" : "bg-gray-400")} />
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                              CAM-0{i + 1}: {cam.time}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
                        <Button variant="ghost" className="rounded-full h-16 w-16 bg-white text-primary hover:bg-accent text-accent-foreground shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500 p-0">
                          <RotateCcw className="h-6 w-6 animate-spin-slow" />
                        </Button>
                      </div>
                    </div>
                    <CardHeader className="p-8">
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <CardTitle className="text-2xl font-bold text-primary">{cam.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-accent" /> {cam.location}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className={cn(
                          "rounded-full px-4 h-8 font-bold border-2 transition-all",
                          cam.status === 'Active' ? "border-green-500/20 text-green-600 bg-green-50" : "border-gray-300 text-gray-400 bg-gray-50"
                        )}>
                          {cam.status}
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'tasks' && (
            <div className="animate-in fade-in duration-500">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-16">
                <div>
                  <h1 className="text-5xl font-headline font-bold text-primary">Working Section</h1>
                  <p className="text-muted-foreground mt-2 text-lg">Manage and track internal studio tasks and pending work.</p>
                </div>

                <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold rounded-full h-14 px-8 shadow-xl transition-all hover:scale-105">
                      <PlusCircle className="mr-3 h-5 w-5" />
                      Add New Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="font-headline text-3xl">Create New Task</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 pt-6">
                      <div className="space-y-2">
                        <Label>Task Title</Label>
                        <Input
                          placeholder="e.g. Restore Vintage Clock"
                          value={newTask.title}
                          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Detailed Description</Label>
                        <Textarea
                          placeholder="Describe the pending work and related details..."
                          className="min-h-[120px]"
                          value={newTask.description}
                          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        />
                      </div>
                      <Button className="w-full h-14 bg-accent text-accent-foreground font-bold text-lg rounded-2xl" onClick={handleAddTask}>
                        Add to Registry
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {tasks.length === 0 ? (
                  <Card className="border-2 border-dashed p-16 text-center bg-white/50 rounded-[3rem]">
                    <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
                      <ClipboardList className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                    <h3 className="text-2xl font-headline font-bold text-primary mb-2">No active tasks</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto">Your working registry is clear. Add a task to start tracking your progress.</p>
                  </Card>
                ) : (
                  tasks.map((task) => (
                    <Card
                      key={task.id}
                      className={cn(
                        "border-none shadow-xl rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all group border-2",
                        task.status === 'Completed' ? "bg-green-50/50 border-green-200/50" :
                          task.status === 'Pending' ? "bg-yellow-50/50 border-yellow-200/50" :
                            "bg-red-50/50 border-red-200/50"
                      )}
                    >
                      <CardHeader className="p-8 pb-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground border-muted-foreground/20">
                                {task.id}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest italic">{task.createdAt}</span>
                            </div>
                            <CardTitle className="text-2xl font-headline font-bold text-primary group-hover:text-accent transition-colors">
                              {task.title}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-3 self-end md:self-auto">
                            <Select
                              value={task.status}
                              onValueChange={(val) => updateTaskStatus(task.id, val as Task['status'])}
                            >
                              <SelectTrigger className={cn(
                                "h-11 w-[160px] text-[10px] font-bold uppercase tracking-widest rounded-full border-2",
                                task.status === 'Completed' && "border-green-500/20 text-green-600 bg-green-50",
                                task.status === 'Pending' && "border-yellow-500/20 text-yellow-600 bg-yellow-50",
                                task.status === 'Not Applicable' && "border-red-500/20 text-red-600 bg-red-50"
                              )}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-11 w-11 rounded-full text-muted-foreground hover:bg-accent/10 hover:text-accent transition-colors"
                              onClick={() => {
                                setEditingTask(task);
                                setIsEditTaskOpen(true);
                              }}
                            >
                              <Pencil className="h-5 w-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-11 w-11 rounded-full text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
                              onClick={() => {
                                if (confirm("Are you sure you want to remove this task?")) {
                                  removeTask(task.id);
                                  toast({ title: "Task Removed", description: "The task has been deleted from the registry." });
                                }
                              }}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-8 pt-0">
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {task.description || "No additional details provided."}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-headline text-3xl">Refine Task Details</DialogTitle>
                  </DialogHeader>
                  {editingTask && (
                    <div className="space-y-6 pt-6">
                      <div className="space-y-2">
                        <Label>Task Title</Label>
                        <Input 
                          value={editingTask.title}
                          onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Detailed Description</Label>
                        <Textarea 
                          className="min-h-[120px]"
                          value={editingTask.description}
                          onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                        />
                      </div>
                      <Button className="w-full h-14 bg-accent text-accent-foreground font-bold text-lg rounded-2xl" onClick={handleUpdateTask}>
                        Save Modifications
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
