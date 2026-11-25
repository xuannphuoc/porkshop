import { Trash2 } from "lucide-react";
import { Link } from "react-router";
import { useShop } from "../context/ShopContext";
import type { CartDetail } from "../context/ShopContext";
import { calculateLineTotal, formatCurrency } from "../utils/format";
import ProductImage from "./ProductImage";
import QuantityControl from "./QuantityControl";

interface CartItemRowProps {
  item: CartDetail;
  onNavigate?: () => void;
  compact?: boolean;
}

export default function CartItemRow({ item, onNavigate, compact = false }: CartItemRowProps) {
  const { changeCartQuantity, removeFromCart } = useShop();
  const product = item.product;
  const productUrl = "/products/" + product.id;
  const lineTotal = calculateLineTotal(product.pricePerKg, item.quantityKg);

  function updateQuantity(quantityKg: number) {
    changeCartQuantity(product.id, quantityKg);
  }

  function removeItem() {
    removeFromCart(product.id);
  }

  return (
    <div className={compact ? "flex gap-4 border-b border-[#edf0eb] py-4 last:border-b-0" : "flex flex-wrap gap-4 border-b border-[#eef0ec] p-5 last:border-b-0 sm:flex-nowrap sm:p-6"}>
      <Link className="shrink-0" to={productUrl} onClick={onNavigate}>
        <ProductImage
          source={product.image}
          alt={product.name}
          className={compact ? "h-20 w-20 rounded-xl" : "h-28 w-28 rounded-2xl"}
        />
      </Link>
      <div className="min-w-0 flex-1">
        <Link to={productUrl} onClick={onNavigate} className="text-sm font-extrabold text-forest hover:underline">
          {product.name}
        </Link>
        <p className="mt-1 text-xs text-[#899c8f]">{formatCurrency(product.pricePerKg)} /kg</p>
        <div className="mt-3">
          <QuantityControl
            quantityKg={item.quantityKg}
            maximumQuantityKg={product.stockKg}
            onQuantityChange={updateQuantity}
            productName={product.name}
          />
        </div>
      </div>
      <div className="flex flex-col items-end justify-between gap-3">
        <span className="whitespace-nowrap text-sm font-extrabold text-forest">{formatCurrency(lineTotal)}</span>
        <button
          type="button"
          onClick={removeItem}
          aria-label={"Xóa " + product.name + " khỏi giỏ hàng"}
          className="flex items-center gap-1 text-xs font-bold text-[#bd7768] hover:underline"
        >
          <Trash2 size={14} /> Xóa
        </button>
      </div>
    </div>
  );
}
