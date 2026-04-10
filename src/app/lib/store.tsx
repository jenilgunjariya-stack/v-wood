"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Clock, CartItem, Order, Employee, Rating, Task, LogisticsLog, HelpRequest } from './types';

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
  userBankName: string;
  isAdmin: boolean;
  isDelivery: boolean;
  searchQuery: string;
  storeSettings: StoreSettings;
  ratings: Rating[];
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
  setUserBankName: (bankName: string) => void;
  setStoreSettings: (settings: StoreSettings) => void;
  login: (name: string, isAdminUser?: boolean, isDeliveryUser?: boolean) => void;
  logout: () => void;
  updateEmployeeStatus: (empId: string, status: Employee['paymentStatus']) => void;
  payAllEmployees: () => void;
  addEmployee: (emp: Employee) => void;
  updateEmployee: (emp: Employee) => void;
  removeEmployee: (id: string) => void;
  resetPayroll: () => void;
  updateAttendance: (empId: string, date: string, status: any) => void;
  favorites: Clock[];
  toggleFavorite: (product: Clock) => void;
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

async function saveServerStore(key: string, data: any) {
  try {
    await fetch(`/api/store?key=${key}`, {
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
  const [userBankName, setUserBankNameState] = useState("");
  const [isAdmin, setIsAdminState] = useState(false);
  const [isDelivery, setIsDeliveryState] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [storeSettings, setStoreSettingsState] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [favorites, setFavorites] = useState<Clock[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logisticsLogs, setLogisticsLogs] = useState<LogisticsLog[]>([]);
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

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
      fetchServerStore('ratings'),
      fetchServerStore('help')
    ]).then(([serverProducts, sOrders, sSettings, sEmployees, sTasks, sLogs, sRatings, sHelp]) => {
      if (serverProducts && serverProducts.length > 0) {
        setProducts(serverProducts);
        localStorage.setItem('timely_finds_products', JSON.stringify(serverProducts));
      } else {
        const savedProducts = localStorage.getItem('timely_finds_products');
        if (savedProducts) { try { setProducts(JSON.parse(savedProducts)); } catch (e) { } }
      }

      if (sOrders) { setOrders(sOrders); localStorage.setItem('timely_finds_orders', JSON.stringify(sOrders)); }
      if (sSettings) { 
        if (sSettings.locationUrl === "https://maps.app.goo.gl/ZhmgVKeVN4otaHQS6?g_st=ac") {
          sSettings.locationUrl = "https://maps.app.goo.gl/p1XQ5AaNtbfgfFbn9?g_st=ac";
        }
        setStoreSettingsState(sSettings); 
        localStorage.setItem('timely_finds_settings', JSON.stringify(sSettings)); 
      }
      if (sEmployees) { setEmployees(sEmployees); localStorage.setItem('timely_finds_employees', JSON.stringify(sEmployees)); }
      if (sTasks) { setTasks(sTasks); localStorage.setItem('timely_finds_tasks', JSON.stringify(sTasks)); }
      if (sLogs) { setLogisticsLogs(sLogs); localStorage.setItem('timely_finds_logs', JSON.stringify(sLogs)); }
      if (sRatings) { setRatings(sRatings); localStorage.setItem('timely_finds_ratings', JSON.stringify(sRatings)); }
      if (sHelp) { setHelpRequests(sHelp); localStorage.setItem('timely_finds_help', JSON.stringify(sHelp)); }

      setIsHydrated(true);
    });

    // Poll server for product updates every 30 seconds (cross-device real-time sync)
    const pollInterval = setInterval(async () => {
      const serverProducts = await fetchProductsFromServer();
      if (serverProducts && serverProducts.length > 0) {
        setProducts(serverProducts);
        localStorage.setItem('timely_finds_products', JSON.stringify(serverProducts));
      }
    }, 30000);

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
          case 'timely_finds_help': setHelpRequests(value); break;
        }
      } catch (err) {
        console.error("Storage sync failed", err);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, []);

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

  const addOrder = (order: Order) => {
    const newOrders = [order, ...orders];
    setOrders(newOrders);
    localStorage.setItem('timely_finds_orders', JSON.stringify(newOrders));
    saveServerStore('orders', newOrders);

    const updatedProducts = products.map(p => {
      const orderItem = order.items.find(item => item.id === p.id);
      if (orderItem) {
        return { ...p, stock: Math.max(0, p.stock - orderItem.quantity) };
      }
      return p;
    });
    updateProducts(updatedProducts);
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

  const cancelOrder = (orderId: string) => {
    const orderToCancel = orders.find(o => o.id === orderId);
    if (!orderToCancel || orderToCancel.status === 'Cancelled' || orderToCancel.status === 'Shipped' || orderToCancel.status === 'Delivered') return;

    // 1. Update Order Status
    const newOrders = orders.map(o => o.id === orderId ? { ...o, status: 'Cancelled' as const } : o);
    setOrders(newOrders);
    localStorage.setItem('timely_finds_orders', JSON.stringify(newOrders));
    saveServerStore('orders', newOrders);

    // 2. Restore Stock
    const updatedProducts = products.map(p => {
      const orderItem = orderToCancel.items.find(item => item.id === p.id);
      if (orderItem) {
        return { ...p, stock: p.stock + orderItem.quantity };
      }
      return p;
    });
    updateProducts(updatedProducts);

    // 3. Notify Admin (Simulation)
    console.log(`[ADMIN NOTIFICATION]: Order ${orderId} has been CANCELLED by the customer.`);
  };

  const updateProducts = (newProducts: Clock[]) => {
    setProducts(newProducts);
    localStorage.setItem('timely_finds_products', JSON.stringify(newProducts));
    // 🌐 Save to server so ALL users see the updated catalog
    saveProductsToServer(newProducts);
  };

  const updateEmployeeStatus = (empId: string, status: Employee['paymentStatus']) => {
    const newEmployees = employees.map(emp => {
      if (emp.id === empId) {
        return {
          ...emp,
          paymentStatus: status,
          lastPaidDate: status === 'Paid' ? new Date().toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' }) : undefined
        };
      }
      return emp;
    });
    setEmployees(newEmployees);
    localStorage.setItem('timely_finds_employees', JSON.stringify(newEmployees));
    saveServerStore('employees', newEmployees);
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

  const toggleFavorite = (product: Clock) => {
    const isFav = favorites.some(fav => fav.id === product.id);
    let newFavorites;
    if (isFav) {
      newFavorites = favorites.filter(fav => fav.id !== product.id);
    } else {
      newFavorites = [...favorites, product];
    }
    setFavorites(newFavorites);
    localStorage.setItem('timely_finds_favorites', JSON.stringify(newFavorites));
  };

  const setUserName = (name: string) => {
    setUserNameState(name);
    localStorage.setItem('timely_finds_user_name', name);
  };

  const setUserEmail = (email: string) => {
    setUserEmailState(email);
    localStorage.setItem('timely_finds_user_email', email);
  };

  const setUserPhoto = (photo: string) => {
    setUserPhotoState(photo);
    localStorage.setItem('timely_finds_user_photo', photo);
  };

  const setUserAddress = (address: string) => {
    setUserAddressState(address);
    localStorage.setItem('timely_finds_user_address', address);
  };

  const setUserBankName = (bankName: string) => {
    setUserBankNameState(bankName);
    localStorage.setItem('timely_finds_user_bank', bankName);
  };

  const setStoreSettings = (settings: StoreSettings) => {
    setStoreSettingsState(settings);
    localStorage.setItem('timely_finds_settings', JSON.stringify(settings));
    saveServerStore('settings', settings);
  };

  const login = (email: string, isAdminUser: boolean = false, isDeliveryUser: boolean = false) => {
    // Email is the unique identity — userName stores the email as unique key
    // Users can set a friendly display name from the profile page (setUserName)
    setIsAdminState(isAdminUser);
    setIsDeliveryState(isDeliveryUser);
    localStorage.setItem('timely_finds_is_admin', isAdminUser.toString());
    localStorage.setItem('timely_finds_is_delivery', isDeliveryUser.toString());

    // Restore per-user profile data keyed by email
    try {
      const profilesRaw = localStorage.getItem('timely_finds_user_profiles');
      const profiles: Record<string, { displayName: string; email: string; photo: string; address: string; bankName: string }> =
        profilesRaw ? JSON.parse(profilesRaw) : {};
      const saved = profiles[email];
      if (saved) {
        // Returning user — restore their display name and profile data
        const displayName = saved.displayName || email;
        setUserNameState(displayName);
        setUserEmailState(email);
        setUserPhotoState(saved.photo || "");
        setUserAddressState(saved.address || "");
        setUserBankNameState(saved.bankName || "");
        localStorage.setItem('timely_finds_user_name', displayName);
        localStorage.setItem('timely_finds_user_email', email);
        localStorage.setItem('timely_finds_user_photo', saved.photo || "");
        localStorage.setItem('timely_finds_user_address', saved.address || "");
        localStorage.setItem('timely_finds_user_bank', saved.bankName || "");
      } else {
        // New user — use email as display name initially, clear other fields
        setUserNameState(email);
        setUserEmailState(email);
        setUserPhotoState("");
        setUserAddressState("");
        setUserBankNameState("");
        localStorage.setItem('timely_finds_user_name', email);
        localStorage.setItem('timely_finds_user_email', email);
        localStorage.setItem('timely_finds_user_photo', "");
        localStorage.setItem('timely_finds_user_address', "");
        localStorage.setItem('timely_finds_user_bank', "");
      }
    } catch (e) {
      // Fallback
      setUserNameState(email);
      setUserEmailState(email);
      localStorage.setItem('timely_finds_user_name', email);
      localStorage.setItem('timely_finds_user_email', email);
    }
  };

  /** Persist current user's profile keyed by their EMAIL (identity key) before clearing session */
  const saveCurrentUserProfile = (name: string, email: string, photo: string, address: string, bankName: string) => {
    // Key profiles by email (the login identity), not display name
    const key = email || name;
    if (!key || key === 'Guest') return;
    try {
      const profilesRaw = localStorage.getItem('timely_finds_user_profiles');
      const profiles: Record<string, { displayName: string; email: string; photo: string; address: string; bankName: string }> =
        profilesRaw ? JSON.parse(profilesRaw) : {};
      profiles[key] = { displayName: name, email, photo, address, bankName };
      localStorage.setItem('timely_finds_user_profiles', JSON.stringify(profiles));
    } catch (e) { }
  };

  const logout = () => {
    // Save current profile data indexed by username before clearing
    saveCurrentUserProfile(userName, userEmail, userPhoto, userAddress, userBankName);

    setUserNameState("Guest");
    setUserEmailState("");
    setUserPhotoState("");
    setUserAddressState("");
    setUserBankNameState("");
    setIsAdminState(false);
    setIsDeliveryState(false);
    localStorage.removeItem('timely_finds_user_name');
    localStorage.removeItem('timely_finds_user_email');
    localStorage.removeItem('timely_finds_user_photo');
    localStorage.removeItem('timely_finds_user_address');
    localStorage.removeItem('timely_finds_user_bank');
    localStorage.removeItem('timely_finds_is_admin');
    localStorage.removeItem('timely_finds_is_delivery');
  };

  const isFavorite = (id: string) => favorites.some(fav => fav.id === id);

  const addRating = (ratingData: Omit<Rating, 'id' | 'date'>) => {
    // Remove any previous rating by the same user for the same product before adding
    const filteredRatings = ratings.filter(
      r => !(r.productId === ratingData.productId && r.userName === ratingData.userName)
    );
    const newRating: Rating = {
      ...ratingData,
      id: `RAT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      date: new Date().toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    };
    const newRatings = [...filteredRatings, newRating];
    setRatings(newRatings);
    localStorage.setItem('timely_finds_ratings', JSON.stringify(newRatings));
    saveServerStore('ratings', newRatings);
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

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `TASK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      createdAt: new Date().toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    };
    const newTasks = [newTask, ...tasks];
    setTasks(newTasks);
    localStorage.setItem('timely_finds_tasks', JSON.stringify(newTasks));
    saveServerStore('tasks', newTasks);
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    const newTasks = tasks.map(t => t.id === taskId ? { ...t, status } : t);
    setTasks(newTasks);
    localStorage.setItem('timely_finds_tasks', JSON.stringify(newTasks));
    saveServerStore('tasks', newTasks);
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

  const addHelpRequest = (requestData: Omit<HelpRequest, 'id' | 'date' | 'status'>) => {
    const newRequest: HelpRequest = {
      ...requestData,
      id: `HELP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      status: 'Pending',
      date: new Date().toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    };
    const newRequests = [newRequest, ...helpRequests];
    setHelpRequests(newRequests);
    localStorage.setItem('timely_finds_help', JSON.stringify(newRequests));
    saveServerStore('help', newRequests);
  };

  const updateHelpRequestStatus = (id: string, status: HelpRequest['status']) => {
    const newRequests = helpRequests.map(h => h.id === id ? { ...h, status } : h);
    setHelpRequests(newRequests);
    localStorage.setItem('timely_finds_help', JSON.stringify(newRequests));
    saveServerStore('help', newRequests);
  };

  const removeHelpRequest = (id: string) => {
    const newRequests = helpRequests.filter(h => h.id !== id);
    setHelpRequests(newRequests);
    localStorage.setItem('timely_finds_help', JSON.stringify(newRequests));
    saveServerStore('help', newRequests);
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
      products, cart, orders, employees, userName, userEmail, userPhoto, userAddress, userBankName, isAdmin, isDelivery, searchQuery, storeSettings,
      setSearchQuery, addToCart, removeFromCart, updateQuantity, clearCart,
      addOrder, updateOrderStatus, cancelOrder, updateProducts, setUserName, setUserEmail, setUserPhoto, setUserAddress, setUserBankName, setStoreSettings,
      login, logout, updateEmployeeStatus, payAllEmployees, addEmployee, updateEmployee, removeEmployee, resetPayroll, updateAttendance,
      favorites, toggleFavorite, isFavorite, ratings, addRating, getAverageRating, getProductRatings, getUserRating,
      tasks, addTask, updateTaskStatus, updateTask, removeTask, logisticsLogs,
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