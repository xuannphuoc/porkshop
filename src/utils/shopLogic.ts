import type { CartItem, Order, Product } from "../features/products/types/products";

export const WEIGHT_STEP_KG = 0.5;

export function isValidQuantity(quantityKg: number): boolean {
  if (Number.isFinite(quantityKg) === false) {
    return false;
  }
  if (quantityKg < WEIGHT_STEP_KG) {
    return false;
  }
  const numberOfSteps = quantityKg / WEIGHT_STEP_KG;
  return Math.abs(numberOfSteps - Math.round(numberOfSteps)) < 0.0000001;
}

export function getDecreasedQuantity(quantityKg: number, stockKg: number): number {
  const requestedQuantity = quantityKg - WEIGHT_STEP_KG;
  const maximumAllowedQuantity = Math.floor(stockKg / WEIGHT_STEP_KG) * WEIGHT_STEP_KG;
  if (requestedQuantity > maximumAllowedQuantity) {
    return maximumAllowedQuantity;
  }
  return requestedQuantity;
}

export function checkQuantity(quantityKg: number, stockKg: number): string | null {
  if (isValidQuantity(quantityKg) === false) {
    return "Khối lượng phải là bội số của 0,5 kg và ít nhất 0,5 kg.";
  }
  if (Number.isFinite(stockKg) === false || stockKg < quantityKg) {
    return "Số lượng vượt quá tồn kho hiện tại.";
  }
  return null;
}

export function restoreCartItems(savedValue: unknown): CartItem[] {
  if (Array.isArray(savedValue) === false) {
    return [];
  }
  const restoredItems: CartItem[] = [];
  for (const savedItem of savedValue) {
    if (savedItem === null || typeof savedItem !== "object") {
      continue;
    }
    if (typeof savedItem.productId !== "string" || savedItem.productId.trim() === "") {
      continue;
    }
    if (typeof savedItem.quantityKg !== "number" || isValidQuantity(savedItem.quantityKg) === false) {
      continue;
    }
    // Không chấp nhận trùng ID từ dữ liệu localStorage đã bị chỉnh sửa.
    if (restoredItems.some(function (item) { return item.productId === savedItem.productId; })) {
      continue;
    }
    restoredItems.push({ productId: savedItem.productId, quantityKg: savedItem.quantityKg });
  }
  return restoredItems;
}

export function restoreOrders(savedValue: unknown): Order[] {
  if (Array.isArray(savedValue) === false) {
    return [];
  }
  return savedValue.filter(function (value): value is Order {
    if (value === null || typeof value !== "object") {
      return false;
    }
    if (typeof value.id !== "string" || typeof value.createdAt !== "string") {
      return false;
    }
    if (value.customer === null || typeof value.customer !== "object") {
      return false;
    }
    if (typeof value.customer.fullName !== "string" || typeof value.customer.phone !== "string") {
      return false;
    }
    if (typeof value.customer.address !== "string" || typeof value.customer.district !== "string") {
      return false;
    }
    if (Array.isArray(value.items) === false || value.items.length === 0) {
      return false;
    }
    if (value.items.some(function (item: unknown) {
      if (item === null || typeof item !== "object") {
        return true;
      }
      const line = item as Record<string, unknown>;
      return typeof line.productId !== "string" || typeof line.productName !== "string" ||
        typeof line.pricePerKg !== "number" || !Number.isFinite(line.pricePerKg) || line.pricePerKg <= 0 ||
        typeof line.quantityKg !== "number" || isValidQuantity(line.quantityKg) === false;
    })) {
      return false;
    }
    return typeof value.subtotal === "number" && Number.isFinite(value.subtotal) &&
      typeof value.shipping === "number" && Number.isFinite(value.shipping) &&
      typeof value.total === "number" && Number.isFinite(value.total) &&
      ["pending", "confirmed", "delivered", "cancelled"].includes(value.status);
  });
}

export function isProduct(value: unknown): value is Product {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const product = value as Record<string, unknown>;
  const allowedCategories = ["thit-tuoi", "suon", "noi-tang", "che-bien"];
  return typeof product.id === "string" && product.id.trim() !== "" &&
    typeof product.name === "string" && product.name.trim() !== "" &&
    typeof product.category === "string" && allowedCategories.includes(product.category) &&
    typeof product.pricePerKg === "number" && Number.isFinite(product.pricePerKg) && product.pricePerKg > 0 &&
    typeof product.stockKg === "number" && Number.isFinite(product.stockKg) && product.stockKg >= 0 &&
    typeof product.description === "string" && typeof product.image === "string" &&
    typeof product.origin === "string" && typeof product.featured === "boolean" &&
    typeof product.rating === "number" && Number.isFinite(product.rating) &&
    product.rating >= 0 && product.rating <= 5 &&
    (product.badge === undefined || typeof product.badge === "string");
}

export function restoreProducts(savedValue: unknown): Product[] | null {
  if (Array.isArray(savedValue) === false) {
    return null;
  }
  const allValid = savedValue.every(isProduct);
  if (allValid === false) {
    return null;
  }
  const productIds = new Set(savedValue.map(function (product) { return product.id; }));
  if (productIds.size !== savedValue.length) {
    return null;
  }
  return savedValue;
}

export function calculateOrderStock(products: Product[], cartItems: CartItem[]): Product[] | null {
  for (const cartItem of cartItems) {
    const product = products.find(function (item) { return item.id === cartItem.productId; });
    if (product === undefined || checkQuantity(cartItem.quantityKg, product.stockKg) !== null) {
      return null;
    }
  }
  return products.map(function (product) {
    const cartItem = cartItems.find(function (item) { return item.productId === product.id; });
    if (cartItem === undefined) {
      return product;
    }
    return { ...product, stockKg: Math.round((product.stockKg - cartItem.quantityKg) * 100) / 100 };
  });
}
