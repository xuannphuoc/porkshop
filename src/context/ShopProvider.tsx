import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ShopContext } from "./ShopContext";
import type { CartDetail, ShopNotification } from "./ShopContext";
import type { CartItem, CustomerInformation, Order, OrderStatus, Product } from "../features/products/types/products";
import { useAuth } from "../auth/AuthContext";
import { requestApi } from "../utils/api";
import { calculateLineTotal, calculateShipping } from "../utils/format";
import { checkQuantity, restoreCartItems, WEIGHT_STEP_KG } from "../utils/shopLogic";

const CART_STORAGE_KEY = "xt-meat-cart-v1";

function readCart(): CartItem[] {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved === null) return [];
    return restoreCartItems(JSON.parse(saved));
  } catch {
    return [];
  }
}

interface ShopProviderProps { children: ReactNode; }

export function ShopProvider({ children }: ShopProviderProps) {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>(readCart);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [notification, setNotification] = useState<ShopNotification | null>(null);

  useEffect(function () {
    let isActive = true;
    async function loadProducts() {
      try {
        const result = await requestApi<{ products: Product[] }>("/api/products");
        if (isActive) setProducts(result.products);
      } catch (error) {
        if (isActive) setProductsError(error instanceof Error ? error.message : "Không thể tải sản phẩm.");
      } finally {
        if (isActive) setProductsLoading(false);
      }
    }
    void loadProducts();
    return function () { isActive = false; };
  }, []);

  useEffect(function () {
    try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems)); } catch { /* Browser may block storage */ }
  }, [cartItems]);

  useEffect(function () {
    let isActive = true;
    async function loadOrders() {
      if (authLoading === true) return;
      if (user === null) {
        setOrders([]);
        return;
      }
      try {
        const path = user.role === "admin" ? "/api/admin/orders" : "/api/orders";
        const result = await requestApi<{ orders: Order[] }>(path);
        if (isActive) setOrders(result.orders);
      } catch (error) {
        if (isActive) {
          setOrders([]);
          setNotification({ kind: "error", message: error instanceof Error ? error.message : "Không thể tải đơn hàng." });
        }
      }
    }
    void loadOrders();
    return function () { isActive = false; };
  }, [authLoading, user]);

  const cartDetails: CartDetail[] = [];
  let subtotal = 0;
  for (const cartItem of cartItems) {
    const product = products.find(function (item) { return item.id === cartItem.productId; });
    if (product !== undefined) {
      cartDetails.push({ product, quantityKg: cartItem.quantityKg });
      subtotal += calculateLineTotal(product.pricePerKg, cartItem.quantityKg);
    }
  }
  const cartCount = cartDetails.length;
  const shipping = calculateShipping(subtotal);

  function dismissNotification() { setNotification(null); }

  function addToCart(productId: string, quantityKg: number): boolean {
    const product = products.find(function (item) { return item.id === productId; });
    if (product === undefined || product.stockKg < WEIGHT_STEP_KG) {
      setNotification({ message: "Sản phẩm hiện không có sẵn.", kind: "error" });
      return false;
    }
    const existing = cartItems.find(function (item) { return item.productId === productId; });
    let nextQuantity = quantityKg;
    if (existing !== undefined) nextQuantity += existing.quantityKg;
    const error = checkQuantity(nextQuantity, product.stockKg);
    if (error !== null) {
      setNotification({ message: error, kind: "error" });
      return false;
    }
    setCartItems(function (previous) {
      const found = previous.some(function (item) { return item.productId === productId; });
      if (found === false) return [...previous, { productId, quantityKg: nextQuantity }];
      return previous.map(function (item) {
        if (item.productId === productId) return { productId, quantityKg: nextQuantity };
        return item;
      });
    });
    setNotification({ message: "Đã thêm " + product.name + " vào giỏ hàng.", kind: "success" });
    return true;
  }

  function changeCartQuantity(productId: string, quantityKg: number) {
    const product = products.find(function (item) { return item.id === productId; });
    if (product === undefined) return;
    const error = checkQuantity(quantityKg, product.stockKg);
    if (error !== null) {
      setNotification({ message: error, kind: "error" });
      return;
    }
    setCartItems(function (previous) {
      return previous.map(function (item) {
        if (item.productId === productId) return { productId, quantityKg };
        return item;
      });
    });
  }

  function removeFromCart(productId: string) {
    setCartItems(function (previous) { return previous.filter(function (item) { return item.productId !== productId; }); });
  }

  async function reloadProducts() {
    const result = await requestApi<{ products: Product[] }>("/api/products");
    setProducts(result.products);
    return result.products;
  }

  async function placeOrder(customer: CustomerInformation): Promise<{ success: boolean; orderId: string; message: string }> {
    if (cartItems.length === 0 || cartItems.length !== cartDetails.length) {
      return { success: false, orderId: "", message: "Giỏ hàng trống hoặc có sản phẩm không còn tồn tại." };
    }
    try {
      const result = await requestApi<{ order: Order }>("/api/orders", {
        method: "POST",
        body: JSON.stringify({ customer, items: cartItems }),
      });
      setOrders(function (previous) { return [result.order, ...previous]; });
      setCartItems([]);
      setNotification({ message: "Đặt hàng thành công!", kind: "success" });
      await reloadProducts().catch(function () {});
      return { success: true, orderId: result.order.id, message: "Đặt hàng thành công." };
    } catch (error) {
      await reloadProducts().catch(function () {});
      return { success: false, orderId: "", message: error instanceof Error ? error.message : "Không thể đặt hàng." };
    }
  }

  async function addProduct(product: Product): Promise<boolean> {
    try {
      await requestApi("/api/admin/products", { method: "POST", body: JSON.stringify({ product }) });
      await reloadProducts();
      setNotification({ message: "Đã thêm sản phẩm.", kind: "success" });
      return true;
    } catch (error) {
      setNotification({ message: error instanceof Error ? error.message : "Không thể thêm sản phẩm.", kind: "error" });
      return false;
    }
  }

  async function updateProduct(product: Product): Promise<boolean> {
    try {
      await requestApi("/api/admin/products/" + encodeURIComponent(product.id), { method: "PUT", body: JSON.stringify({ product }) });
      await reloadProducts();
      setNotification({ message: "Đã cập nhật sản phẩm.", kind: "success" });
      return true;
    } catch (error) {
      setNotification({ message: error instanceof Error ? error.message : "Không thể cập nhật sản phẩm.", kind: "error" });
      return false;
    }
  }

  async function deleteProduct(productId: string): Promise<boolean> {
    try {
      await requestApi("/api/admin/products/" + encodeURIComponent(productId), { method: "DELETE" });
      await reloadProducts();
      removeFromCart(productId);
      setNotification({ message: "Đã xóa sản phẩm.", kind: "success" });
      return true;
    } catch (error) {
      setNotification({ message: error instanceof Error ? error.message : "Không thể xóa sản phẩm.", kind: "error" });
      return false;
    }
  }

  async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    try {
      const result = await requestApi<{ order: Order }>("/api/admin/orders/" + encodeURIComponent(orderId) + "/status", {
        method: "PATCH", body: JSON.stringify({ status }),
      });
      setOrders(function (previous) { return previous.map(function (order) { return order.id === orderId ? result.order : order; }); });
      await reloadProducts();
      setNotification({ message: "Đã cập nhật đơn hàng.", kind: "success" });
      return true;
    } catch (error) {
      setNotification({ message: error instanceof Error ? error.message : "Không thể cập nhật đơn hàng.", kind: "error" });
      return false;
    }
  }

  return (
    <ShopContext.Provider value={{
      products, productsLoading, productsError,
      cartItems, cartDetails, cartCount, subtotal, shipping,
      cartOpen, notification, orders, setCartOpen, dismissNotification,
      addToCart, changeCartQuantity, removeFromCart, placeOrder,
      addProduct, updateProduct, deleteProduct, updateOrderStatus,
    }}>
      {children}
    </ShopContext.Provider>
  );
}
