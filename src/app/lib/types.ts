
export interface Clock {
  id: string;
  name: string;
  price: number;
  description: string;
  style: string;
  category: string;
  imageUrl: string;
  specifications: string[];
  stock: number;
  shape?: string;
  color?: string;
  discountPrice?: number;
  ratings?: number[]; // Legacy average support
}

export interface Rating {
  id: string;
  productId: string;
  userName: string;
  userPhoto?: string;
  rating: number; // 1-5
  comment?: string;
  date: string;
}

export interface CartItem extends Clock {
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'Confirmed' | 'Awaiting Verification' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  customerEmail?: string;
  paymentMethod: 'Card' | 'UPI' | 'COD' | 'In-Shop';
  userName?: string;
  userEmail?: string;
  transactionId?: string;
  cardLast4?: string;
  cardHolderName?: string;
  upiId?: string;
}

export interface LoginLog {
  id: string;
  email: string;
  timestamp: string;
  device?: string;
  role?: string;
}

export interface LogisticsLog {
  id: string;
  deliveryBoyName: string;
  orderId: string;
  action: string;
  timestamp: string;
}

export interface Employee {
  id: string;
  name: string;
  salary: number;
  role: string;
  paymentStatus: 'Pending' | 'Paid';
  lastPaidDate?: string;
  attendance?: Record<string, 'Present' | 'Absent' | 'Late' | 'Off'>;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'Completed' | 'Pending' | 'Not Applicable';
  createdAt: string;
}

export interface HelpRequest {
  id: string;
  name: string;
  contact: string;
  message: string;
  status: 'Pending' | 'Resolved';
  date: string;
}
