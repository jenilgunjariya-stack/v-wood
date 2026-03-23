"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Clock, CartItem, Order, Employee } from './types';

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
}

const INITIAL_PRODUCTS: Clock[] = [
  {
    id: "minimalist-horizon-oak",
    name: "Minimalist Horizon",
    price: 8999,
    description: "A sleek, wood-crafted wall clock that brings a touch of nature and simplicity to any modern living space.",
    style: "Minimalist",
    imageUrl: "https://picsum.photos/seed/clock1/600/600",
    specifications: ["Diameter: 12 inches", "Material: Oak Wood", "Movement: Silent Quartz", "Weight: 1.2 lbs"],
    stock: 15
  },
  {
    id: "mid-century-solaris-flare",
    name: "Solaris Flare",
    price: 18500,
    description: "Inspired by the mid-century modern aesthetic, the Solaris Flare features a stunning sunburst design with brass accents.",
    style: "Mid-Century",
    imageUrl: "https://picsum.photos/seed/clock2/600/600",
    specifications: ["Diameter: 24 inches", "Material: Brass & Walnut", "Movement: Precision Quartz", "Weight: 3.5 lbs"],
    stock: 8
  },
  {
    id: "industrial-iron-foundry",
    name: "Iron Foundry",
    price: 14200,
    description: "A bold industrial piece with exposed gears and a rugged metal finish, perfect for loft-style interiors.",
    style: "Industrial",
    imageUrl: "https://picsum.photos/seed/clock3/600/600",
    specifications: ["Diameter: 18 inches", "Material: Distressed Iron", "Movement: Mechanical Gear", "Weight: 5.0 lbs"],
    stock: 5
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
  },
  {
    id: "emp-3",
    name: "Anjali Sharma",
    salary: 22000,
    role: "Inventory Manager",
    paymentStatus: "Pending",
    attendance: {}
  }
];

const INITIAL_SETTINGS: StoreSettings = {
  name: "V-WOOD QUARTZ",
  address: "7-lati plot sanala road morbi-363641",
  email: "support@vwoodquartz.com",
  phone: "+91 9727408352",
  openingHours: "8:00 AM - 6:00 PM (Closed on Wednesdays)",
  logoUrl: "https://img1.wsimg.com/isteam/ip/613470c5-0d44-4b59-8433-95c1c7696081/PicsArt_06-30-03.41.35.jpg",
  heroImageUrl: "https://i.imgur.com/6vIzIjy.jpeg",
  ownerName: "JENILBHAI GUNJARIYA",
  paymentQrCodeUrl: "https://picsum.photos/seed/qr-code/400/400",
  locationUrl: "https://maps.app.goo.gl/ZhmgVKeVN4otaHQS6?g_st=ac",
  upiId: "jenilgunjariya@oksbi"
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
  isAdmin: boolean;
  searchQuery: string;
  storeSettings: StoreSettings;
  setSearchQuery: (query: string) => void;
  addToCart: (product: Clock) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateProducts: (newProducts: Clock[]) => void;
  setUserName: (name: string) => void;
  setUserEmail: (email: string) => void;
  setUserPhoto: (photo: string) => void;
  setUserAddress: (address: string) => void;
  setStoreSettings: (settings: StoreSettings) => void;
  login: (name: string, isAdminUser?: boolean) => void;
  logout: () => void;
  updateEmployeeStatus: (empId: string, status: Employee['paymentStatus']) => void;
  payAllEmployees: () => void;
  addEmployee: (emp: Employee) => void;
  updateEmployee: (emp: Employee) => void;
  removeEmployee: (id: string) => void;
  resetPayroll: () => void;
  updateAttendance: (empId: string, date: string, status: Employee['attendance'][string]) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Clock[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [userName, setUserNameState] = useState<string>("Guest");
  const [userEmail, setUserEmailState] = useState<string>("");
  const [userPhoto, setUserPhotoState] = useState<string>("");
  const [userAddress, setUserAddressState] = useState<string>("");
  const [isAdmin, setIsAdminState] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [storeSettings, setStoreSettingsState] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('timely_finds_cart');
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) {}
    }
    
    const savedProducts = localStorage.getItem('timely_finds_products');
    if (savedProducts) {
      try { setProducts(JSON.parse(savedProducts)); } catch (e) {}
    }

    const savedOrders = localStorage.getItem('timely_finds_orders');
    if (savedOrders) {
      try { setOrders(JSON.parse(savedOrders)); } catch (e) {}
    }

    const savedEmployees = localStorage.getItem('timely_finds_employees');
    if (savedEmployees) {
      try { setEmployees(JSON.parse(savedEmployees)); } catch (e) {}
    }

    const savedName = localStorage.getItem('timely_finds_user_name');
    if (savedName) setUserNameState(savedName);

    const savedEmail = localStorage.getItem('timely_finds_user_email');
    if (savedEmail) setUserEmailState(savedEmail);

    const savedPhoto = localStorage.getItem('timely_finds_user_photo');
    if (savedPhoto) setUserPhotoState(savedPhoto);

    const savedAddress = localStorage.getItem('timely_finds_user_address');
    if (savedAddress) setUserAddressState(savedAddress);

    const savedAdmin = localStorage.getItem('timely_finds_is_admin');
    if (savedAdmin) setIsAdminState(savedAdmin === 'true');

    const savedSettings = localStorage.getItem('timely_finds_settings');
    if (savedSettings) {
      try { setStoreSettingsState(JSON.parse(savedSettings)); } catch (e) {}
    }
    
    setIsHydrated(true);
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
  };

  const updateProducts = (newProducts: Clock[]) => {
    setProducts(newProducts);
    localStorage.setItem('timely_finds_products', JSON.stringify(newProducts));
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
  };

  const addEmployee = (emp: Employee) => {
    const newEmployees = [...employees, { ...emp, attendance: {} }];
    setEmployees(newEmployees);
    localStorage.setItem('timely_finds_employees', JSON.stringify(newEmployees));
  };

  const updateEmployee = (emp: Employee) => {
    const newEmployees = employees.map(e => e.id === emp.id ? emp : e);
    setEmployees(newEmployees);
    localStorage.setItem('timely_finds_employees', JSON.stringify(newEmployees));
  };

  const removeEmployee = (id: string) => {
    const newEmployees = employees.filter(e => e.id !== id);
    setEmployees(newEmployees);
    localStorage.setItem('timely_finds_employees', JSON.stringify(newEmployees));
  };

  const resetPayroll = () => {
    const resetEmployees = employees.map(emp => ({
      ...emp,
      paymentStatus: 'Pending' as const,
      lastPaidDate: undefined
    }));
    setEmployees(resetEmployees);
    localStorage.setItem('timely_finds_employees', JSON.stringify(resetEmployees));
  };

  const updateAttendance = (empId: string, date: string, status: Employee['attendance'][string]) => {
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

  const setStoreSettings = (settings: StoreSettings) => {
    setStoreSettingsState(settings);
    localStorage.setItem('timely_finds_settings', JSON.stringify(settings));
  };

  const login = (name: string, isAdminUser: boolean = false) => {
    setUserName(name);
    setIsAdminState(isAdminUser);
    localStorage.setItem('timely_finds_is_admin', isAdminUser.toString());
  };

  const logout = () => {
    setUserNameState("Guest");
    setUserEmailState("");
    setUserPhotoState("");
    setUserAddressState("");
    setIsAdminState(false);
    localStorage.removeItem('timely_finds_user_name');
    localStorage.removeItem('timely_finds_user_email');
    localStorage.removeItem('timely_finds_user_photo');
    localStorage.removeItem('timely_finds_user_address');
    localStorage.removeItem('timely_finds_is_admin');
  };

  if (!isHydrated) return null;

  return (
    <StoreContext.Provider value={{
      products, cart, orders, employees, userName, userEmail, userPhoto, userAddress, isAdmin, searchQuery, storeSettings,
      setSearchQuery, addToCart, removeFromCart, updateQuantity, clearCart,
      addOrder, updateOrderStatus, updateProducts, setUserName, setUserEmail, setUserPhoto, setUserAddress, setStoreSettings,
      login, logout, updateEmployeeStatus, payAllEmployees, addEmployee, updateEmployee, removeEmployee, resetPayroll, updateAttendance
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
