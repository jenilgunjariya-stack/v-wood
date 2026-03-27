
export interface Clock {
  id: string;
  name: string;
  price: number;
  description: string;
  style: string;
  imageUrl: string;
  specifications: string[];
  stock: number;
  shape?: string;
  color?: string;
  discountPrice?: number;
}

export interface CartItem extends Clock {
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'Awaiting Verification' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered';
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
