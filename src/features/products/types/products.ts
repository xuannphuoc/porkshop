export type ProductCategory = "thit-tuoi" | "suon" | "noi-tang" | "che-bien";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  pricePerKg: number;
  stockKg: number;
  description: string;
  image: string;
  origin: string;
  featured: boolean;
  badge?: string;
  rating: number;
}

export interface CartItem {
  productId: string;
  quantityKg: number;
}

export interface CustomerInformation {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  district: string;
  note: string;
  paymentMethod: "cod" | "transfer";
}

export interface OrderLine {
  productId: string;
  productName: string;
  pricePerKg: number;
  quantityKg: number;
}

export type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";

export interface Order {
  id: string;
  createdAt: string;
  customer: CustomerInformation;
  items: OrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
}
