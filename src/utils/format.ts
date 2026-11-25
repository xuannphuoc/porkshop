export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatWeight(weightKg: number): string {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 2,
  }).format(weightKg) + " kg";
}

export function calculateLineTotal(pricePerKg: number, quantityKg: number): number {
  return Math.round(pricePerKg * quantityKg);
}

export function calculateShipping(subtotal: number): number {
  if (subtotal >= 350000 || subtotal === 0) {
    return 0;
  }
  return 25000;
}
