import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../public/data/products.json", import.meta.url), "utf8");
const products = JSON.parse(source);
const productIds = new Set();
const validCategories = new Set(["thit-tuoi", "suon", "noi-tang", "che-bien"]);

if (Array.isArray(products) === false) {
  throw new Error("products.json phải chứa một mảng.");
}

for (const product of products) {
  if (typeof product.id !== "string" || productIds.has(product.id)) {
    throw new Error("Product ID không hợp lệ hoặc trùng lặp: " + product.id);
  }
  if (typeof product.name !== "string" || validCategories.has(product.category) === false) {
    throw new Error("Tên hoặc danh mục không hợp lệ: " + product.id);
  }
  if (typeof product.pricePerKg !== "number" || product.pricePerKg < 0) {
    throw new Error("Giá không hợp lệ: " + product.id);
  }
  if (typeof product.stockKg !== "number" || product.stockKg < 0) {
    throw new Error("Tồn kho không hợp lệ: " + product.id);
  }
  productIds.add(product.id);
}

console.log("✓ Đã kiểm tra " + products.length + " sản phẩm, ID không trùng lặp.");
