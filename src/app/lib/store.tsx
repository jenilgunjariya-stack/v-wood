"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Clock, CartItem, Order, Employee, Rating, Task, LogisticsLog, HelpRequest, LoginLog } from './types';
import { db } from "@/lib/firebase";
import { collection, doc, onSnapshot, setDoc, updateDoc, addDoc, query, orderBy, limit, getDoc, getDocs } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

export interface StoreSettings {
  name: string;
  address: string;
  email: string;
  phone: string;
  openingHours: string;
  logoUrl: string;
  heroImageUrl: string;
  ownerName: string;
  paymentQrCodeUrl: string;
  locationUrl: string;
  upiId: string;
  bankName: string;
  accountNumber: string;
}

const INITIAL_PRODUCTS: Clock[] = [
  {
    id: "minimalist-horizon-oak",
    name: "Minimalist Horizon",
    price: 8999,
    description: "A sleek, wood-crafted wall clock that brings a touch of nature and simplicity to any modern living space.",
    style: "Minimalist",
    category: "Wall Clock",
    imageUrl: "https://picsum.photos/seed/clock1/600/600",
    specifications: ["Diameter: 12 inches", "Material: Oak Wood", "Movement: Silent Quartz", "Weight: 1.2 lbs"],
    stock: 15,
    shape: "Round",
    color: "Oak"
  },
  {
    id: "mid-century-solaris-flare",
    name: "Solaris Flare",
    price: 18500,
    description: "Inspired by the mid-century modern aesthetic, the Solaris Flare features a stunning sunburst design with brass accents.",
    style: "Mid-Century",
    category: "Wall Clock",
    imageUrl: "https://picsum.photos/seed/clock2/600/600",
    specifications: ["Diameter: 24 inches", "Material: Brass & Walnut", "Movement: Precision Quartz", "Weight: 3.5 lbs"],
    stock: 8,
    shape: "Round",
    color: "Walnut",
    discountPrice: 15999
  },
  {
    id: "industrial-iron-foundry",
    name: "Iron Foundry",
    price: 14200,
    description: "A bold industrial piece with exposed gears and a rugged metal finish, perfect for loft-style interiors.",
    style: "Industrial",
    category: "Wall Clock",
    imageUrl: "https://picsum.photos/seed/clock3/600/600",
    specifications: ["Diameter: 18 inches", "Material: Distressed Iron", "Movement: Mechanical Gear", "Weight: 5.0 lbs"],
    stock: 5,
    shape: "Square",
    color: "Charcoal"
  }
];

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: "emp-1",
    name: "Rajesh Kumar",
    salary: 25000,
    role: "Master Wood Craftsman",
    paymentStatus: "Pending",
    attendance: {}
  },
  {
    id: "emp-2",
    name: "Suresh Patel",
    salary: 18000,
    role: "Quality Inspector",
    paymentStatus: "Paid",
    lastPaidDate: "Oct 01, 2023",
    attendance: {}
  }
];

const INITIAL_SETTINGS: StoreSettings = {
  name: "V-WOOD QUARTZ",
  address: "6/7-Lati Plot Sanala Road Morbi-363641",
  email: "support@vwoodquartz.com",
  phone: "+91 9727408352",
  openingHours: "8:00 AM - 6:00 PM (Closed on Wednesdays)",
  logoUrl: "https://img1.wsimg.com/isteam/ip/613470c5-0d44-4b59-8433-95c1c7696081/PicsArt_06-30-03.41.35.jpg", // Fixed global circular logo reference
  heroImageUrl: "https://i.imgur.com/6vIzIjy.jpeg",
  ownerName: "Jenil Nileshbhai Gunjariya",
  paymentQrCodeUrl: "https://picsum.photos/seed/qr-code/400/400",
  locationUrl: "https://maps.app.goo.gl/p1XQ5AaNtbfgfFbn9?g_st=ac",
  upiId: "jenilgunjariya@oksbi",
  bankName: "State Bank of India",
  accountNumber: "392740835201"
};

interface StoreContextType {
  products: Clock[];
  cart: CartItem[];
  orders: Order[];
  employees: Employee[];
  userName: string;
  userEmail: string;
  userPhoto: string;
  userAddress: string;
  userPhone: string;
  userBankName: string;
  isAdmin: boolean;
  isDelivery: boolean;
  searchQuery: string;
  storeSettings: StoreSettings;
  ratings: Rating[];
  loginLogs: LoginLog[];
  addRating: (rating: Omit<Rating, 'id' | 'date'>) => void;
  getAverageRating: (productId: string) => number;
  getProductRatings: (productId: string) => Rating[];
  getUserRating: (productId: string) => Rating | undefined;
  setSearchQuery: (query: string) => void;
  addToCart: (product: Clock) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  cancelOrder: (orderId: string) => void;
  updateProducts: (newProducts: Clock[]) => void;
  setUserName: (name: string) => void;
  setUserEmail: (email: string) => void;
  setUserPhoto: (photo: string) => void;
  setUserAddress: (address: string) => void;
  setUserPhone: (phone: string) => void;
  setUserBankName: (bankName: string) => void;
  setStoreSettings: (settings: StoreSettings) => void;
  login: (name: string, isAdminUser?: boolean, isDeliveryUser?: boolean) => Promise<void>;
  logout: () => void;
  updateEmployeeStatus: (empId: string, status: Employee['paymentStatus']) => void;
  payAllEmployees: () => void;
  addEmployee: (emp: Employee) => void;
  updateEmployee: (emp: Employee) => void;
  removeEmployee: (id: string) => void;
  resetPayroll: () => void;
  updateAttendance: (empId: string, date: string, status: any) => void;
  favorites: Clock[];
  toggleFavorite: (product: Clock) => Promise<void>;
  isFavorite: (id: string) => boolean;
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTaskStatus: (taskId: string, status: Task['status']) => void;
  updateTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
  logisticsLogs: LogisticsLog[];
  helpRequests: HelpRequest[];
  addHelpRequest: (request: Omit<HelpRequest, 'id' | 'date' | 'status'>) => void;
  updateHelpRequestStatus: (id: string, status: HelpRequest['status']) => void;
  removeHelpRequest: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Sync products with server (API route writes to data/products.json)
async function fetchProductsFromServer(): Promise<Clock[] | null> {
  try {
    const res = await fetch('/api/products', { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Could not fetch products from server:', e);
  }
  return null;
}

async function saveProductsToServer(products: Clock[]) {
  try {
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(products)
    });
  } catch (e) {
    console.warn('Could not save products to server:', e);
  }
}

async function fetchServerStore(key: string) {
  try {
    const res = await fetch(`/api/store?key=${key}`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn(`Could not fetch ${key} from server:`, e);
  }
  return null;
}

async function saveServerStore(key: string, data: any, action?: 'add') {
  try {
    const url = `/api/store?key=${key}${action ? `&action=${action}` : ''}`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (e) {
    console.warn(`Could not save ${key} to server:`, e);
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Clock[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [userName, setUserNameState] = useState<string>("Guest");
  const [userEmail, setUserEmailState] = useState<string>("");
  const [userPhoto, setUserPhotoState] = useState<string>("");
  const [userAddress, setUserAddressState] = useState("");
  const [userPhone, setUserPhoneState] = useState("");
  const [userBankName, setUserBankNameState] = useState("");
  const [isAdmin, setIsAdminState] = useState(false);
  const [isDelivery, setIsDeliveryState] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [storeSettings, setStoreSettingsState] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [favorites, setFavorites] = useState<Clock[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logisticsLogs, setLogisticsLogs] = useState<LogisticsLog[]>([]);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Sync state across multiple tabs instantly (same browser)
  const handleStorageChange = (e: StorageEvent) => {
    if (!e.newValue) return;

    try {
      const value = JSON.parse(e.newValue);
      switch (e.key) {
        case 'timely_finds_settings': setStoreSettingsState(value); break;
        case 'timely_finds_products': setProducts(value); break;
        case 'timely_finds_orders': setOrders(value); break;
        case 'timely_finds_employees': setEmployees(value); break;
        case 'timely_finds_is_delivery': setIsDeliveryState(value === 'true'); break;
        case 'timely_finds_favorites': setFavorites(value); break;
        case 'timely_finds_ratings': setRatings(value); break;
        case 'timely_finds_tasks': setTasks(value); break;
        case 'timely_finds_logs': setLogisticsLogs(value); break;
        case 'timely_finds_login_logs': setLoginLogs(value); break;
        case 'timely_finds_help': setHelpRequests(value); break;
      }
    } catch (err) {
      console.error("Storage sync failed", err);
    }
  };

  useEffect(() => {
    const savedCart = localStorage.getItem('timely_finds_cart');
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) { }
    }

    const savedOrders = localStorage.getItem('timely_finds_orders');
    if (savedOrders) {
      try { setOrders(JSON.parse(savedOrders)); } catch (e) { }
    }

    const savedEmployees = localStorage.getItem('timely_finds_employees');
    if (savedEmployees) {
      try { setEmployees(JSON.parse(savedEmployees)); } catch (e) { }
    }

    const savedName = localStorage.getItem('timely_finds_user_name');
    if (savedName) setUserNameState(savedName);

    const savedEmail = localStorage.getItem('timely_finds_user_email');
    if (savedEmail) setUserEmailState(savedEmail);

    const savedPhoto = localStorage.getItem('timely_finds_user_photo');
    if (savedPhoto) setUserPhotoState(savedPhoto);

    const savedAddress = localStorage.getItem('timely_finds_user_address');
    if (savedAddress) setUserAddressState(savedAddress);

    const savedPhone = localStorage.getItem('timely_finds_user_phone');
    if (savedPhone) setUserPhoneState(savedPhone);

    const savedBank = localStorage.getItem('timely_finds_user_bank');
    if (savedBank) setUserBankNameState(savedBank);

    const savedAdmin = localStorage.getItem('timely_finds_is_admin');
    if (savedAdmin) setIsAdminState(savedAdmin === 'true');

    const savedDelivery = localStorage.getItem('timely_finds_is_delivery');
    if (savedDelivery) setIsDeliveryState(savedDelivery === 'true');

    const savedSettings = localStorage.getItem('timely_finds_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.locationUrl === "https://maps.app.goo.gl/ZhmgVKeVN4otaHQS6?g_st=ac") {
          parsed.locationUrl = "https://maps.app.goo.gl/p1XQ5AaNtbfgfFbn9?g_st=ac";
          localStorage.setItem('timely_finds_settings', JSON.stringify(parsed));
        }
        setStoreSettingsState(parsed);
      } catch (e) { }
    }

    const savedFavorites = localStorage.getItem('timely_finds_favorites');
    if (savedFavorites) {
      try { setFavorites(JSON.parse(savedFavorites)); } catch (e) { }
    }

    const savedRatings = localStorage.getItem('timely_finds_ratings');
    if (savedRatings) {
      try { setRatings(JSON.parse(savedRatings)); } catch (e) { }
    }

    const savedTasks = localStorage.getItem('timely_finds_tasks');
    if (savedTasks) {
      try { setTasks(JSON.parse(savedTasks)); } catch (e) { }
    }

    const savedLogs = localStorage.getItem('timely_finds_logs');
    if (savedLogs) {
      try { setLogisticsLogs(JSON.parse(savedLogs)); } catch (e) { }
    }

    const savedLoginLogs = localStorage.getItem('timely_finds_login_logs');
    if (savedLoginLogs) {
      try { setLoginLogs(JSON.parse(savedLoginLogs)); } catch (e) { }
    }

    const savedHelp = localStorage.getItem('timely_finds_help');
    if (savedHelp) {
      try { setHelpRequests(JSON.parse(savedHelp)); } catch (e) { }
    }

    // 🌐 PRIORITY: Load products and global state from SERVER (shared across all browsers/devices)
    Promise.all([
      fetchProductsFromServer(),
      fetchServerStore('orders'),
      fetchServerStore('settings'),
      fetchServerStore('employees'),
      fetchServerStore('tasks'),
      fetchServerStore('logs'),
      fetchServerStore('login_logs'),
      fetchServerStore('ratings'),
      fetchServerStore('help'),
      fetchServerStore('profiles')
    ]).then(([serverProducts, sOrders, sSettings, sEmployees, sTasks, sLogs, sLoginLogs, sRatings, sHelp, sProfiles]) => {
      if (serverProducts && serverProducts.length > 0) {
        setProducts(serverProducts);
        localStorage.setItem('timely_finds_products', JSON.stringify(serverProducts));
      } else {
        const savedProducts = localStorage.getItem('timely_finds_products');
        if (savedProducts) { try { setProducts(JSON.parse(savedProducts)); } catch (e) { } }
      }

      const handleGlobalSync = (serverData: any, localKey: string, setStateFn: any, defaultFallback?: any) => {
        if (serverData) {
          setStateFn(serverData);
          localStorage.setItem(localKey, JSON.stringify(serverData));
        } else {
          const localStr = localStorage.getItem(localKey);
          if (localStr) {
            try { 
              const p = JSON.parse(localStr); 
              setStateFn(p); 
              saveServerStore(localKey.replace('timely_finds_', ''), p); 
            } catch(e){}
          } else if (defaultFallback) {
             setStateFn(defaultFallback);
             saveServerStore(localKey.replace('timely_finds_', ''), defaultFallback); 
          }
        }
      };

      handleGlobalSync(sOrders, 'timely_finds_orders', setOrders);
      
      if (sSettings) { 
        if (sSettings.locationUrl === "https://maps.app.goo.gl/ZhmgVKeVN4otaHQS6?g_st=ac") {
          sSettings.locationUrl = "https://maps.app.goo.gl/p1XQ5AaNtbfgfFbn9?g_st=ac";
        }
        setStoreSettingsState(sSettings); 
        localStorage.setItem('timely_finds_settings', JSON.stringify(sSettings)); 
      } else {
        const localStr = localStorage.getItem('timely_finds_settings');
        if (localStr) {
          try { 
            const p = JSON.parse(localStr); 
            if (p.locationUrl === "https://maps.app.goo.gl/ZhmgVKeVN4otaHQS6?g_st=ac") p.locationUrl = "https://maps.app.goo.gl/p1XQ5AaNtbfgfFbn9?g_st=ac";
            setStoreSettingsState(p); 
            saveServerStore('settings', p); 
          } catch(e){}
        }
      }

      handleGlobalSync(sEmployees, 'timely_finds_employees', setEmployees);
      handleGlobalSync(sTasks, 'timely_finds_tasks', setTasks);
      handleGlobalSync(sLogs, 'timely_finds_logs', setLogisticsLogs);
      handleGlobalSync(sLoginLogs, 'timely_finds_login_logs', setLoginLogs);
      handleGlobalSync(sRatings, 'timely_finds_ratings', setRatings);
      handleGlobalSync(sHelp, 'timely_finds_help', setHelpRequests);

      if (sProfiles) {
        localStorage.setItem('timely_finds_user_profiles', JSON.stringify(sProfiles));
        
        // 🌐 SYNC CURRENT USER: If we're already logged in, apply the latest profile from the server immediately
        const currentEmail = localStorage.getItem('timely_finds_user_email');
        if (currentEmail && sProfiles[currentEmail]) {
          const profile = sProfiles[currentEmail];
          if (profile.displayName) { setUserNameState(profile.displayName); localStorage.setItem('timely_finds_user_name', profile.displayName); }
          if (profile.photo) { setUserPhotoState(profile.photo); localStorage.setItem('timely_finds_user_photo', profile.photo); }
          if (profile.address) { setUserAddressState(profile.address); localStorage.setItem('timely_finds_user_address', profile.address); }
          if (profile.phone) { setUserPhoneState(profile.phone); localStorage.setItem('timely_finds_user_phone', profile.phone); }
          if (profile.bankName) { setUserBankNameState(profile.bankName); localStorage.setItem('timely_finds_user_bank', profile.bankName); }
        }
      } else {
        const localStr = localStorage.getItem('timely_finds_user_profiles');
        if (localStr) {
           saveServerStore('profiles', JSON.parse(localStr));
        }
      }

      setIsHydrated(true);
    });

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // 🌐 SHARED POLLING: Sync global data across all devices/locations
  useEffect(() => {
    if (!isHydrated) return;

    // 1. Listen for Orders in Real-Time
    const ordersQuery = query(collection(db, "orders"), orderBy("date", "desc"));
    const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
      const newOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      
      // Real-time Notification logic
      if (isAdmin && orders.length > 0 && newOrders.length > orders.length) {
        const latestOrder = newOrders[0];
        if (latestOrder.id !== orders[0]?.id) {
          // triggerOrderNotification(latestOrder); // Assuming this helper exists
        }
      }
      
      setOrders(newOrders);
      localStorage.setItem('timely_finds_orders', JSON.stringify(newOrders));
    });

    // 2. Listen for Products
    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const newProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Clock));
      setProducts(newProducts);
      localStorage.setItem('timely_finds_products', JSON.stringify(newProducts));
    });

    // 3. Listen for Favorites (Synced globally per user)
    let unsubFavs: (() => void) | undefined;
    if (userEmail && userEmail !== 'Guest') {
      unsubFavs = onSnapshot(doc(db, "users", userEmail), (snapshot) => {
        const data = snapshot.data();
        if (data && data.favorites) {
          setFavorites(data.favorites);
          localStorage.setItem('timely_finds_favorites', JSON.stringify(data.favorites));
        }
      });
    }

    // 4. Listen for Settings
    const unsubSettings = onSnapshot(doc(db, "settings", "global"), (snapshot) => {
      const data = snapshot.data();
      if (data) {
        setStoreSettingsState(data as StoreSettings);
        localStorage.setItem('timely_finds_settings', JSON.stringify(data));
      }
    });

    // 5. Listen for Employees
    const unsubEmployees = onSnapshot(collection(db, "employees"), (snapshot) => {
      const newEmployees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
      setEmployees(newEmployees);
      localStorage.setItem('timely_finds_employees', JSON.stringify(newEmployees));
    });

    // 6. Listen for Ratings
    const unsubRatings = onSnapshot(collection(db, "ratings"), (snapshot) => {
      const newRatings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Rating));
      setRatings(newRatings);
      localStorage.setItem('timely_finds_ratings', JSON.stringify(newRatings));
    });

    // 7. Listen for Tasks (Admin/Employees)
    const unsubTasks = onSnapshot(collection(db, "tasks"), (snapshot) => {
      const newTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(newTasks);
      localStorage.setItem('timely_finds_tasks', JSON.stringify(newTasks));
    });

    // 8. Listen for Logistics Logs
    const unsubLogs = onSnapshot(collection(db, "logs"), (snapshot) => {
      const newLogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LogisticsLog));
      setLogisticsLogs(newLogs);
      localStorage.setItem('timely_finds_logs', JSON.stringify(newLogs));
    });

    // 9. Listen for Help Requests
    const unsubHelp = onSnapshot(collection(db, "help"), (snapshot) => {
      const newHelp = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HelpRequest));
      setHelpRequests(newHelp);
      localStorage.setItem('timely_finds_help', JSON.stringify(newHelp));
    });

    return () => {
      unsubOrders();
      unsubProducts();
      unsubSettings();
      unsubEmployees();
      unsubRatings();
      unsubTasks();
      unsubLogs();
      unsubHelp();
      if (typeof unsubFavs === 'function') unsubFavs();
    };
  }, [isAdmin, userEmail, isHydrated]);

  // Helper for real-time alerts
  const triggerOrderNotification = (order: Order) => {
    // 1. Play Sound (if allowed)
    try {
      const audio = new Audio('/chime.mp3');
      audio.play().catch(() => console.log('Audio autoplay blocked by browser. User interaction required first.'));
    } catch (e) {
      console.log('Audio not supported or missing.');
    }

    // 2. Browser Alert (Permissions checked on Admin page)
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('V-WOOD: New Order!', {
        body: `Order #${order.id} from ${order.customerName} for RS. ${order.total.toLocaleString()}`,
        icon: '/favicon.ico'
      });
    }

    // 3. UI Toast
    toast({
      title: "New Order Detected!",
      description: `Order #${order.id} from ${order.customerName} has arrived in real-time.`,
    });
  };



  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('timely_finds_cart', JSON.stringify(newCart));
  };

  const addToCart = (product: Clock) => {
    const latestProduct = products.find(p => p.id === product.id);
    if (!latestProduct || latestProduct.stock <= 0) return;

    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity >= latestProduct.stock) return;
      saveCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      saveCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (id: string) => {
    saveCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    if (quantity <= 0) {
      removeFromCart(id);
    } else if (quantity <= product.stock) {
      saveCart(cart.map(item => item.id === id ? { ...item, quantity } : item));
    }
  };

  const clearCart = () => saveCart([]);

  const addOrder = async (order: Order) => {
    try {
      // 🚀 CENTRALIZED: Save to Firestore
      await setDoc(doc(db, "orders", order.id), order);
      
      const updatedProducts = products.map(p => {
        const orderItem = order.items.find(item => item.id === p.id);
        if (orderItem) {
          return { ...p, stock: Math.max(0, p.stock - orderItem.quantity) };
        }
        return p;
      });
      updateProducts(updatedProducts);
    } catch (error) {
      console.error("Error adding order to Firestore:", error);
      toast({ variant: "destructive", title: "Order Sync Failed", description: "Your order was placed but could not be synced to the cloud." });
    }
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const newOrders = orders.map(o => o.id === orderId ? { ...o, status } : o);
    setOrders(newOrders);
    localStorage.setItem('timely_finds_orders', JSON.stringify(newOrders));
    saveServerStore('orders', newOrders);

    // Record activity for logistics monitoring
    const newLog: LogisticsLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      deliveryBoyName: isDelivery ? userName : "Studio Administrator",
      orderId: orderId,
      action: `Status updated to "${status}"`,
      timestamp: new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      })
    };

    const updatedLogs = [newLog, ...logisticsLogs].slice(0, 500);
    setLogisticsLogs(updatedLogs);
    localStorage.setItem('timely_finds_logs', JSON.stringify(updatedLogs));
    saveServerStore('logs', updatedLogs);
  };

  const cancelOrder = async (orderId: string) => {
    const orderToCancel = orders.find(o => o.id === orderId);
    if (!orderToCancel || orderToCancel.status === 'Cancelled' || orderToCancel.status === 'Shipped' || orderToCancel.status === 'Delivered') return;

    try {
      // 1. Update Order Status in Firestore
      await updateDoc(doc(db, "orders", orderId), { status: 'Cancelled' });

      // 2. Restore Stock in Firestore
      const updatedProducts = products.map(p => {
        const orderItem = orderToCancel.items.find(item => item.id === p.id);
        if (orderItem) {
          return { ...p, stock: p.stock + orderItem.quantity };
        }
        return p;
      });
      updateProducts(updatedProducts);
    } catch (error) {
      console.error("Error cancelling order in Firestore:", error);
    }
  };

  const updateProducts = async (newProducts: Clock[]) => {
    try {
      // 🌐 Batch update or individual updates for products in Firestore
      // For simplicity and to avoid large writes, we'll update the whole products state 
      // which triggers the snapshot listener for all clients.
      const productsRef = collection(db, "products");
      for (const product of newProducts) {
        await setDoc(doc(productsRef, product.id), product);
      }
    } catch (error) {
      console.error("Error updating products in Firestore:", error);
    }
  };

  const updateEmployeeStatus = async (empId: string, status: Employee['paymentStatus']) => {
    try {
      await updateDoc(doc(db, "employees", empId), { paymentStatus: status });
    } catch (error) {
      console.error("Error updating employee status:", error);
    }
  };

  const payAllEmployees = () => {
    const newEmployees = employees.map(emp => {
      if (emp.paymentStatus === 'Pending') {
        return {
          ...emp,
          paymentStatus: 'Paid' as const,
          lastPaidDate: new Date().toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' })
        };
      }
      return emp;
    });
    setEmployees(newEmployees);
    localStorage.setItem('timely_finds_employees', JSON.stringify(newEmployees));
    saveServerStore('employees', newEmployees);
  };

  const addEmployee = (emp: Employee) => {
    const newEmployees = [...employees, { ...emp, attendance: {} }];
    setEmployees(newEmployees);
    localStorage.setItem('timely_finds_employees', JSON.stringify(newEmployees));
    saveServerStore('employees', newEmployees);
  };

  const updateEmployee = (emp: Employee) => {
    const newEmployees = employees.map(e => e.id === emp.id ? emp : e);
    setEmployees(newEmployees);
    localStorage.setItem('timely_finds_employees', JSON.stringify(newEmployees));
    saveServerStore('employees', newEmployees);
  };

  const removeEmployee = (id: string) => {
    const newEmployees = employees.filter(e => e.id !== id);
    setEmployees(newEmployees);
    localStorage.setItem('timely_finds_employees', JSON.stringify(newEmployees));
    saveServerStore('employees', newEmployees);
  };

  const resetPayroll = () => {
    const resetEmployees = employees.map(emp => ({
      ...emp,
      paymentStatus: 'Pending' as const,
      lastPaidDate: undefined
    }));
    setEmployees(resetEmployees);
    localStorage.setItem('timely_finds_employees', JSON.stringify(resetEmployees));
    saveServerStore('employees', resetEmployees);
  };

  const updateAttendance = (empId: string, date: string, status: any) => {
    const newEmployees = employees.map(emp => {
      if (emp.id === empId) {
        return {
          ...emp,
          attendance: {
            ...(emp.attendance || {}),
            [date]: status
          }
        };
      }
      return emp;
    });
    setEmployees(newEmployees);
    localStorage.setItem('timely_finds_employees', JSON.stringify(newEmployees));
    saveServerStore('employees', newEmployees);
  };

  const toggleFavorite = async (product: Clock) => {
    const isFav = favorites.some(fav => fav.id === product.id);
    let newFavorites;
    if (isFav) {
      newFavorites = favorites.filter(fav => fav.id !== product.id);
    } else {
      newFavorites = [...favorites, product];
    }
    
    setFavorites(newFavorites);
    localStorage.setItem('timely_finds_favorites', JSON.stringify(newFavorites));

    // 🚀 SYNC TO FIRESTORE: Persistent across devices
    if (userEmail && userEmail !== 'Guest') {
      try {
        await setDoc(doc(db, "users", userEmail), { favorites: newFavorites }, { merge: true });
      } catch (error) {
        console.error("Error syncing favorites:", error);
      }
    }
  };

  /** Save active user profile to server + localStorage immediately (called on every profile field change) */
  const persistUserProfile = (name: string, email: string, photo: string, address: string, phone: string, bankName: string) => {
    const key = email || name;
    if (!key || key === 'Guest') return;
    try {
      const profilesRaw = localStorage.getItem('timely_finds_user_profiles');
      const profiles: Record<string, { displayName: string; email: string; photo: string; address: string; phone: string; bankName: string }> =
        profilesRaw ? JSON.parse(profilesRaw) : {};
      profiles[key] = { displayName: name, email, photo, address, phone, bankName };
      localStorage.setItem('timely_finds_user_profiles', JSON.stringify(profiles));
      saveServerStore('profiles', profiles);
    } catch (e) { }
  };

  const setUserName = (name: string) => {
    setUserNameState(name);
    localStorage.setItem('timely_finds_user_name', name);
    persistUserProfile(name, userEmail, userPhoto, userAddress, userPhone, userBankName);
  };

  const setUserEmail = (email: string) => {
    setUserEmailState(email);
    localStorage.setItem('timely_finds_user_email', email);
  };

  const setUserPhoto = (photo: string) => {
    setUserPhotoState(photo);
    localStorage.setItem('timely_finds_user_photo', photo);
    persistUserProfile(userName, userEmail, photo, userAddress, userPhone, userBankName);
  };

  const setUserAddress = (address: string) => {
    setUserAddressState(address);
    localStorage.setItem('timely_finds_user_address', address);
    persistUserProfile(userName, userEmail, userPhoto, address, userPhone, userBankName);
  };

  const setUserPhone = (phone: string) => {
    setUserPhoneState(phone);
    localStorage.setItem('timely_finds_user_phone', phone);
    persistUserProfile(userName, userEmail, userPhoto, userAddress, phone, userBankName);
  };

  const setUserBankName = (bankName: string) => {
    setUserBankNameState(bankName);
    localStorage.setItem('timely_finds_user_bank', bankName);
    persistUserProfile(userName, userEmail, userPhoto, userAddress, userPhone, bankName);
  };

  const setStoreSettings = async (settings: StoreSettings) => {
    try {
      await setDoc(doc(db, "settings", "global"), settings);
    } catch (error) {
       console.error("Error updating settings:", error);
    }
  };

  const login = (email: string, isAdminUser: boolean = false, isDeliveryUser: boolean = false) => {
    setIsAdminState(isAdminUser);
    setIsDeliveryState(isDeliveryUser);
    localStorage.setItem('timely_finds_is_admin', isAdminUser.toString());
    localStorage.setItem('timely_finds_is_delivery', isDeliveryUser.toString());

    const applyProfile = (profiles: Record<string, any>) => {
      const saved = profiles ? profiles[email] : undefined;
      if (saved) {
        const displayName = saved.displayName || email;
        setUserNameState(displayName);
        setUserEmailState(email);
        setUserPhotoState(saved.photo || "");
        setUserAddressState(saved.address || "");
        setUserPhoneState(saved.phone || "");
        setUserBankNameState(saved.bankName || "");
        localStorage.setItem('timely_finds_user_name', displayName);
        localStorage.setItem('timely_finds_user_email', email);
        localStorage.setItem('timely_finds_user_photo', saved.photo || "");
        localStorage.setItem('timely_finds_user_address', saved.address || "");
        localStorage.setItem('timely_finds_user_phone', saved.phone || "");
        localStorage.setItem('timely_finds_user_bank', saved.bankName || "");
      } else {
        setUserNameState(email);
        setUserEmailState(email);
        setUserPhotoState("");
        setUserAddressState("");
        setUserPhoneState("");
        setUserBankNameState("");
        localStorage.setItem('timely_finds_user_name', email);
        localStorage.setItem('timely_finds_user_email', email);
        localStorage.setItem('timely_finds_user_photo', "");
        localStorage.setItem('timely_finds_user_address', "");
        localStorage.setItem('timely_finds_user_phone', "");
        localStorage.setItem('timely_finds_user_bank', "");
      }
    };

    // Fetch profiles from server first (cross-device), fall back to localStorage
    return fetchServerStore('profiles').then((serverProfiles) => {
      if (serverProfiles && serverProfiles[email]) {
        // Server has this user's data — merge into localStorage too
        const localRaw = localStorage.getItem('timely_finds_user_profiles');
        const localProfiles = localRaw ? JSON.parse(localRaw) : {};
        const merged = { ...localProfiles, ...serverProfiles };
        localStorage.setItem('timely_finds_user_profiles', JSON.stringify(merged));
        applyProfile(merged);
      } else {
        // Fall back to whatever is saved in localStorage
        try {
          const profilesRaw = localStorage.getItem('timely_finds_user_profiles');
          const profiles = profilesRaw ? JSON.parse(profilesRaw) : {};
          applyProfile(profiles);
        } catch (e) {
          setUserNameState(email);
          setUserEmailState(email);
          localStorage.setItem('timely_finds_user_name', email);
          localStorage.setItem('timely_finds_user_email', email);
        }
      }

      // 📝 Record Login Log
      const newLog: LoginLog = {
        id: `LOG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        email: email,
        timestamp: new Date().toLocaleString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric', 
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        }),
        role: isAdminUser ? 'Admin' : (isDeliveryUser ? 'Delivery' : 'Customer'),
        device: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 100) : 'Unknown'
      };
      
      setLoginLogs(prev => {
        const updated = [newLog, ...prev];
        localStorage.setItem('timely_finds_login_logs', JSON.stringify(updated));
        saveServerStore('login_logs', updated);
        return updated;
      });
    });
  };

  /** Persist current user's profile keyed by their EMAIL to server + localStorage */
  const saveCurrentUserProfile = (name: string, email: string, photo: string, address: string, phone: string, bankName: string) => {
    const key = email || name;
    if (!key || key === 'Guest') return;
    try {
      const profilesRaw = localStorage.getItem('timely_finds_user_profiles');
      const profiles: Record<string, { displayName: string; email: string; photo: string; address: string; phone: string; bankName: string }> =
        profilesRaw ? JSON.parse(profilesRaw) : {};
      profiles[key] = { displayName: name, email, photo, address, phone, bankName };
      localStorage.setItem('timely_finds_user_profiles', JSON.stringify(profiles));
      saveServerStore('profiles', profiles); // 🌐 push to server for cross-device access
    } catch (e) { }
  };

  const logout = () => {
    // Save current profile data indexed by username before clearing
    saveCurrentUserProfile(userName, userEmail, userPhoto, userAddress, userPhone, userBankName);

    setUserNameState("Guest");
    setUserEmailState("");
    setUserPhotoState("");
    setUserAddressState("");
    setUserPhoneState("");
    setUserBankNameState("");
    setIsAdminState(false);
    setIsDeliveryState(false);
    localStorage.removeItem('timely_finds_user_name');
    localStorage.removeItem('timely_finds_user_email');
    localStorage.removeItem('timely_finds_user_photo');
    localStorage.removeItem('timely_finds_user_address');
    localStorage.removeItem('timely_finds_user_phone');
    localStorage.removeItem('timely_finds_user_bank');
    localStorage.removeItem('timely_finds_is_admin');
    localStorage.removeItem('timely_finds_is_delivery');
  };

  const isFavorite = (id: string) => favorites.some(fav => fav.id === id);

  const addRating = async (ratingData: Omit<Rating, 'id' | 'date'>) => {
    const id = `RAT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const newRating: Rating = {
      ...ratingData,
      id,
      date: new Date().toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    };
    try {
      await setDoc(doc(db, "ratings", id), newRating);
    } catch (error) {
       console.error("Error adding rating:", error);
    }
  };

  const getAverageRating = (productId: string) => {
    const productRatings = ratings.filter(r => r.productId === productId);
    if (productRatings.length === 0) return 0;
    const sum = productRatings.reduce((acc, curr) => acc + curr.rating, 0);
    return parseFloat((sum / productRatings.length).toFixed(1));
  };

  const getProductRatings = (productId: string) => {
    return ratings.filter(r => r.productId === productId);
  };

  /** Returns the rating submitted by the currently logged-in user for a given product */
  const getUserRating = (productId: string): Rating | undefined => {
    if (!userName || userName === 'Guest') return undefined;
    return ratings.find(r => r.productId === productId && r.userName === userName);
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const id = `TASK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const newTask: Task = {
      ...taskData,
      id,
      createdAt: new Date().toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    };
    try {
      await setDoc(doc(db, "tasks", id), newTask);
    } catch (error) {
       console.error("Error adding task:", error);
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      await updateDoc(doc(db, "tasks", taskId), { status });
    } catch (error) {
       console.error("Error updating task status:", error);
    }
  };

  const updateTask = (task: Task) => {
    const newTasks = tasks.map(t => t.id === task.id ? task : t);
    setTasks(newTasks);
    localStorage.setItem('timely_finds_tasks', JSON.stringify(newTasks));
    saveServerStore('tasks', newTasks);
  };

  const removeTask = (taskId: string) => {
    const newTasks = tasks.filter(t => t.id !== taskId);
    setTasks(newTasks);
    localStorage.setItem('timely_finds_tasks', JSON.stringify(newTasks));
    saveServerStore('tasks', newTasks);
  };

  const addHelpRequest = async (requestData: Omit<HelpRequest, 'id' | 'date' | 'status'>) => {
    const id = `HELP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const newRequest: HelpRequest = {
      ...requestData,
      id,
      status: 'Pending',
      date: new Date().toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    };
    try {
      await setDoc(doc(db, "help", id), newRequest);
    } catch (error) {
       console.error("Error adding help request:", error);
    }
  };

  const updateHelpRequestStatus = async (id: string, status: HelpRequest['status']) => {
    try {
      await updateDoc(doc(db, "help", id), { status });
    } catch (error) {
       console.error("Error updating help request status:", error);
    }
  };

  const removeHelpRequest = async (id: string) => {
    try {
      await updateDoc(doc(db, "help", id), { status: 'Closed' });
    } catch (error) {
       console.error("Error closing help request:", error);
    }
  };

  if (!isHydrated) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Loading Catalog...</p>
      </div>
    </div>
  );

  return (
    <StoreContext.Provider value={{
      products, cart, orders, employees, userName, userEmail, userPhoto, userAddress, userPhone, userBankName, isAdmin, isDelivery, searchQuery, storeSettings,
      setSearchQuery, addToCart, removeFromCart, updateQuantity, clearCart,
      addOrder, updateOrderStatus, cancelOrder, updateProducts, setUserName, setUserEmail, setUserPhoto, setUserAddress, setUserPhone, setUserBankName, setStoreSettings,
      login, logout, updateEmployeeStatus, payAllEmployees, addEmployee, updateEmployee, removeEmployee, resetPayroll, updateAttendance,
      favorites, toggleFavorite, isFavorite, ratings, addRating, getAverageRating, getProductRatings, getUserRating,
      tasks, addTask, updateTaskStatus, updateTask, removeTask, logisticsLogs,
      loginLogs,
      helpRequests, addHelpRequest, updateHelpRequestStatus, removeHelpRequest
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}