
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
  status: 'Confirmed' | 'Awaiting Verification' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered';
  customerName: string;
  customerAddress: string;
  paymentMethod: 'Card' | 'UPI' | 'COD';
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
