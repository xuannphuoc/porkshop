import { formatCurrency } from "../utils/format";

interface OrderTotalsProps {
  subtotal: number;
  shipping: number;
}

export default function OrderTotals({ subtotal, shipping }: OrderTotalsProps) {
  let shippingText = formatCurrency(shipping);
  if (shipping === 0) {
    shippingText = "Miễn phí";
  }

  return (
    <div className="space-y-3 text-sm text-[#728579]">
      <div className="flex justify-between gap-3">
        <span>Tạm tính</span>
        <span className="font-bold text-forest">{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex justify-between gap-3">
        <span>Vận chuyển</span>
        <span className="font-bold text-forest">{shippingText}</span>
      </div>
      <div className="flex justify-between gap-3 border-t border-[#e9eee9] pt-4 text-lg font-extrabold text-forest">
        <span>Tổng cộng</span>
        <span>{formatCurrency(subtotal + shipping)}</span>
      </div>
    </div>
  );
}
