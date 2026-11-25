import type { Product } from "../types/products";
import { restoreProducts } from "../../../utils/shopLogic";

export async function getProducts(): Promise<Product[]> {
  const response = await fetch("/api/products");

  if (response.ok === false) {
    throw new Error("Không thể tải danh sách sản phẩm.");
  }

  const data: { products?: unknown } = await response.json();

  const products = restoreProducts(data.products);
  if (products === null) {
    throw new Error("Dữ liệu sản phẩm không hợp lệ.");
  }

  return products;
}

export async function getProductById(productId: string): Promise<Product | undefined> {
  const products = await getProducts();
  const selectedProduct = products.find(function (product) {
    return product.id === productId;
  });
  return selectedProduct;
}
