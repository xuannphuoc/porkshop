import type { Product } from "../types/products";

export function normalizeVietnameseText(text: string): string {
  return text
    .toLocaleLowerCase("vi-VN")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

export function filterAndSortProducts(
  products: Product[],
  category: string,
  searchText: string,
  sortValue: string
): Product[] {
  const normalizedSearch = normalizeVietnameseText(searchText.trim());

  const filteredProducts = products.filter(function (product) {
    const categoryMatches = category === "all" || product.category === category;
    const productText = normalizeVietnameseText(product.name + " " + product.description);
    const searchMatches = productText.includes(normalizedSearch);
    return categoryMatches && searchMatches;
  });

  filteredProducts.sort(function (firstProduct, secondProduct) {
    if (sortValue === "price-asc") {
      return firstProduct.pricePerKg - secondProduct.pricePerKg;
    }
    if (sortValue === "price-desc") {
      return secondProduct.pricePerKg - firstProduct.pricePerKg;
    }
    if (sortValue === "name") {
      return firstProduct.name.localeCompare(secondProduct.name, "vi-VN");
    }
    return Number(secondProduct.featured) - Number(firstProduct.featured);
  });

  return filteredProducts;
}
