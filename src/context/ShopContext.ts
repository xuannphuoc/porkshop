import { createContext, useContext } from "react";
import type { CartItem, CustomerInformation, Order, OrderStatus, Product } from "../features/products/types/products";

export interface CartDetail {
  product: Product;
  quantityKg: number;
}

export interface ShopNotification {
  message: string;
  kind: "success" | "error";
}

export interface ShopContextValue {
  products: Product[];
  productsLoading: boolean;
  productsError: string;
  cartItems: CartItem[];
  cartDetails: CartDetail[];
  cartCount: number;
  subtotal: number;
  shipping: number;
  cartOpen: boolean;
  notification: ShopNotification | null;
  orders: Order[];
  setCartOpen: (open: boolean) => void;
  dismissNotification: () => void;
  addToCart: (productId: string, quantityKg: number) => boolean;
  changeCartQuantity: (productId: string, quantityKg: number) => void;
  removeFromCart: (productId: string) => void;
  placeOrder: (customer: CustomerInformation) => Promise<{ success: boolean; orderId: string; message: string }>;
  addProduct: (product: Product) => Promise<boolean>;
  updateProduct: (product: Product) => Promise<boolean>;
  deleteProduct: (productId: string) => Promise<boolean>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;
}

export const ShopContext = createContext<ShopContextValue | undefined>(undefined);

export function useShop(): ShopContextValue {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error("useShop phải được gọi trong ShopProvider.");
  }
  return context;
}
